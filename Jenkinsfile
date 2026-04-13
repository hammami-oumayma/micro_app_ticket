pipeline {
    agent any
    environment {
        DOCKERHUB_USERNAME = 'hammamioumayma'
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        GITHUB_REPO = 'https://github.com/hammami-oumayma/micro_app_ticket.git'
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'master',
                    url: "${GITHUB_REPO}"
            }
        }
        stage('Build Docker Images') {
            steps {
                sh '''
                    for service in auth client orders payments tickets expiration; do
                        if [ -f "micro-app-clean-master/$service/Dockerfile" ]; then
                            docker build -t ${DOCKERHUB_USERNAME}/$service:${BUILD_NUMBER} \
                                         -t ${DOCKERHUB_USERNAME}/$service:latest \
                                         ./micro-app-clean-master/$service
                        fi
                    done
                '''
            }
        }
        stage('Trivy Scan') {
            steps {
                sh '''
                    trivy image --download-db-only || true
                    for service in auth client orders payments tickets expiration; do
                        trivy image \
                            --exit-code 0 \
                            --severity HIGH,CRITICAL \
                            --skip-db-update \
                            --timeout 10m \
                            ${DOCKERHUB_USERNAME}/$service:latest || true
                    done
                '''
            }
        }
        stage('Push to DockerHub') {
            steps {
                sh '''
                    echo ${DOCKERHUB_CREDENTIALS_PSW} | \
                        docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin
                    for service in auth client orders payments tickets expiration; do
                        docker push ${DOCKERHUB_USERNAME}/$service:${BUILD_NUMBER} || true
                        docker push ${DOCKERHUB_USERNAME}/$service:latest || true
                    done
                '''
            }
        }
        stage('Deploy via ArgoCD') {
            steps {
                sh '''
                    kubectl patch app micro-app -n argocd \
                        --type merge \
                        -p '{"operation": {"initiatedBy": {"username": "jenkins"}, "sync": {"revision": "HEAD"}}}' || true
                '''
            }
        }
    }
    post {
        success {
            echo 'Pipeline SUCCESS'
        }
        failure {
            echo 'Pipeline FAILED'
        }
        always {
            sh 'docker rmi $(docker images -q) 2>/dev/null || true'
        }
    }
}
