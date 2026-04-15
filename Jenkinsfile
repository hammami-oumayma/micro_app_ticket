pipeline {
    agent any
    environment {
        DOCKERHUB_USERNAME = 'hammamioumayma'
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        GITHUB_REPO = 'https://github.com/hammami-oumayma/micro_app_ticket.git'
        SONAR_HOST_URL = 'http://localhost:9000'
        SONAR_TOKEN = 'sqp_79f5220fb795094ee7f12be68267eb1d94483634'
    }
    stages {

        stage('Checkout') {
            steps {
                git branch: 'master',
                    url: "${GITHUB_REPO}"
            }
        }

        stage('SonarQube Analysis') {
            steps {
                sh '''
                    sonar-scanner \
                        -Dsonar.projectKey=micro-app \
                        -Dsonar.sources=./micro-app-clean-master \
                        -Dsonar.host.url=${SONAR_HOST_URL} \
                        -Dsonar.token=${SONAR_TOKEN} || true
                '''
            }
        }

        stage('CodeQL Analysis') {
            steps {
                sh '''
                    if command -v codeql &> /dev/null; then
                        codeql database create codeql-db \
                            --language=javascript \
                            --source-root=./micro-app-clean-master \
                            --overwrite || true
                        codeql database analyze codeql-db \
                            --format=sarif-latest \
                            --output=codeql-results.sarif || true
                        echo "CodeQL done"
                    else
                        echo "CodeQL not found, skipping..."
                    fi
                '''
            }
        }

        stage('OWASP Dependency Check') {
            steps {
                sh '''
                    if command -v dependency-check &> /dev/null; then
                        dependency-check \
                            --project micro_app_ticket \
                            --scan ./micro-app-clean-master \
                            --format HTML \
                            --out ./owasp-report || true
                        echo "OWASP done"
                    else
                        echo "OWASP not found, skipping..."
                    fi
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    for service in auth client orders payments tickets expiration; do
                        if [ -f "micro-app-clean-master/$service/Dockerfile" ]; then
                            docker build \
                                -t ${DOCKERHUB_USERNAME}/$service:${BUILD_NUMBER} \
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

        stage('Snyk Scan') {
            steps {
                sh '''
                    if command -v snyk &> /dev/null; then
                        for service in auth client orders payments tickets expiration; do
                            cd micro-app-clean-master/$service
                            snyk test --severity-threshold=high || true
                            cd ../..
                        done
                    else
                        echo "Snyk not found, skipping..."
                    fi
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
            emailext(
                subject: "SUCCESS - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Build reussi! URL: ${env.BUILD_URL}",
                to: 'oumayma.hammami@tek-up.de'
            )
        }
        failure {
            echo 'Pipeline FAILED'
            emailext(
                subject: "FAILED - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Build echoue! URL: ${env.BUILD_URL}",
                to: 'oumayma.hammami@tek-up.de'
            )
        }
        always {
            sh 'docker rmi $(docker images -q) 2>/dev/null || true'
        }
    }
}
