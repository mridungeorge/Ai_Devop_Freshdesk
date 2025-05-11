pipeline {
    agent any

    environment {
        DOCKER_BUILDKIT = 1
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Test (Docker Compose)') {
            steps {
                sh 'docker-compose down || true'
                sh 'docker-compose up --build -d'
                // Add your test commands here, e.g.:
                // sh 'docker-compose exec backend npm test'
            }
        }

        stage('Teardown Docker Compose') {
            steps {
                sh 'docker-compose down'
            }
        }

        stage('Build & Deploy (Terraform)') {
            steps {
                dir('terraform') {
                    sh 'terraform init'
                    sh 'terraform apply -auto-approve'
                }
                // Add your test commands here, e.g.:
                // sh 'docker exec backend_container_name npm test'
            }
        }

        stage('Teardown Terraform') {
            steps {
                dir('terraform') {
                    sh 'terraform destroy -auto-approve'
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed. Cleaning up...'
            sh 'docker system prune -f || true'
        }
    }
} 