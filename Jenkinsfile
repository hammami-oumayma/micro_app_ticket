pipeline {
    agent any
    environment {
        DOCKERHUB_USERNAME = 'hammamioumayma'
        DOCKERHUB_REPO = 'hammamioumayma'
    }
    stages {

        stage('Checkout code') {
            steps {
                git branch: 'master',
                    url: 'https://github.com/hammami-oumayma/micro_app_ticket.git'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                    script {
                        def projects = ["auth", "client", "expiration", "orders", "payments", "tickets"]
                        for (proj in projects) {
                            sh """
                                echo "Running sonar scanner for ${proj}..."
                                sonar-scanner \
                                    -Dsonar.projectKey=${proj} \
                                    -Dsonar.sources=./micro-app-clean-master/${proj} \
                                    -Dsonar.host.url=http://localhost:9000 \
                                    -Dsonar.token=${SONAR_TOKEN} || true
                            """
                        }
                    }
                }
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
                    else
                        echo "OWASP not found, skipping..."
                    fi
                '''
            }
        }

        stage('Build, Scan & Push Microservices') {
            steps {
                script {
                    def services = ["auth", "client", "expiration", "orders", "payments", "tickets"]
                    sh "mkdir -p trivy-reports"
                    for (service in services) {
                        def imageName = "${DOCKERHUB_USERNAME}/${service}:latest"
                        def servicePath = "micro-app-clean-master/${service}"
                        sh "ls ${servicePath} || echo 'Path not found'"
                        if (fileExists("${servicePath}/Dockerfile")) {
                            echo "Building image for ${service}..."
                            sh "docker build -t ${imageName} ${servicePath}"
                            echo "Scanning ${imageName} with Trivy..."
                            sh """
                                trivy image \
                                    --severity HIGH,CRITICAL \
                                    --no-progress \
                                    --format table \
                                    --output trivy-reports/${service}_report.txt \
                                    ${imageName} || true
                            """
                            sh "cat trivy-reports/${service}_report.txt || true"
                            withCredentials([usernamePassword(
                                credentialsId: 'dockerhub-credentials',
                                usernameVariable: 'DOCKER_USERNAME',
                                passwordVariable: 'DOCKER_PASSWORD'
                            )]) {
                                sh """
                                    echo \$DOCKER_PASSWORD | docker login -u \$DOCKER_USERNAME --password-stdin
                                    docker push ${imageName}
                                    docker logout
                                """
                            }
                        } else {
                            echo "No Dockerfile found for ${service}, skipping..."
                        }
                    }
                }
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
        always {
            archiveArtifacts artifacts: 'trivy-reports/*.txt', allowEmptyArchive: true
        }
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
    }
}
