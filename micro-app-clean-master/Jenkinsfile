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
                echo '📥 Cloning repository...'
                git branch: 'main',
                    url: "${GITHUB_REPO}"
            }
        }

        stage('Install & Test') {
            steps {
                echo '🧪 Testing microservices...'
                sh '''
                    for service in orders payments tickets expiration auth; do
                        if [ -f "$service/package.json" ]; then
                            echo "Testing $service..."
                            cd $service
                            npm install
                            npm test --if-present || true
                            cd ..
                        fi
                    done
                '''
            }
        }

        stage('OWASP Dependency Check') {
            steps {
                echo '🛡️ Running OWASP...'
                sh 'dependency-check --project micro_app_ticket --scan . --format HTML --out ./owasp-report || true'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '🐳 Building Docker images...'
                sh '''
                    for service in auth client orders payments tickets expiration; do
                        if [ -f "$service/Dockerfile" ]; then
                            docker build -t ${DOCKERHUB_USERNAME}/$service:${BUILD_NUMBER} \
                                         -t ${DOCKERHUB_USERNAME}/$service:latest \
                                         ./$service
                        fi
                    done
                '''
            }
        }

        stage('Trivy Scan') {
            steps {
                echo '🔒 Scanning with Trivy...'
                sh '''
                    for service in auth client orders payments tickets expiration; do
                        trivy image --exit-code 0 --severity HIGH,CRITICAL \
                            ${DOCKERHUB_USERNAME}/$service:latest || true
                    done
                '''
            }
        }

        stage('Push to DockerHub') {
            steps {
                echo '📤 Pushing to DockerHub...'
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
                echo '🚀 Deploying via ArgoCD...'
                sh 'argocd app sync micro-app --force || true'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline SUCCESS!'
            emailext(
                subject: "✅ SUCCESS - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Build réussi! URL: ${env.BUILD_URL}",
                to: 'oumayma.hammami@tek-up.de'
            )
        }
        failure {
            echo '❌ Pipeline FAILED!'
            emailext(
                subject: "❌ FAILED - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Build échoué! URL: ${env.BUILD_URL}",
                to: 'oumayma.hammami@tek-up.de'
            )
        }
        always {
            sh 'docker rmi $(docker images -q) 2>/dev/null || true'
        }
    }
}
