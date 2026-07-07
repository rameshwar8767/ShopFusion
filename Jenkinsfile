pipeline {

    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {

        DOCKER_USERNAME = "rameshwar8767"

        FRONTEND_IMAGE = "${DOCKER_USERNAME}/shopfusion-frontend:latest"

        BACKEND_IMAGE = "${DOCKER_USERNAME}/shopfusion-backend:latest"

        ML_IMAGE = "${DOCKER_USERNAME}/shopfusion-ml:latest"

    }

    stages {

        stage('Checkout Source') {

            steps {

                echo "Checking out source..."

                checkout scm

            }

        }

        stage('Build Frontend') {

            steps {

                dir('frontend') {

                    sh 'npm install'

                    sh 'npm run build'

                }

            }

        }

        stage('Install Backend Dependencies') {

            steps {

                dir('backend') {

                    sh 'npm install'

                }

            }

        }

        stage('Build ML Engine') {

            steps {

                dir('ml-engine') {

                    sh 'pip install -r requirements.txt'

                }

            }

        }

        stage('Build Docker Images') {

            steps {

                sh "docker build -t ${FRONTEND_IMAGE} ./frontend"

                sh "docker build -t ${BACKEND_IMAGE} ./backend"

                sh "docker build -t ${ML_IMAGE} ./ml-engine"

            }

        }

        stage('Docker Login') {

            steps {

                withCredentials([

                    usernamePassword(

                        credentialsId: 'dockerhub',

                        usernameVariable: 'DOCKER_USER',

                        passwordVariable: 'DOCKER_PASS'

                    )

                ]) {

                    sh '''
                    echo "$DOCKER_PASS" | docker login \
                    -u "$DOCKER_USER" \
                    --password-stdin
                    '''

                }

            }

        }

        stage('Push Images') {

            steps {

                sh "docker push ${FRONTEND_IMAGE}"

                sh "docker push ${BACKEND_IMAGE}"

                sh "docker push ${ML_IMAGE}"

            }

        }

        stage('Generate Environment File') {

            steps {

                withCredentials([

                    string(credentialsId: 'mongo-uri', variable: 'MONGO_URI'),

                    string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET'),

                    string(credentialsId: 'client-url', variable: 'CLIENT_URL'),

                    string(credentialsId: 'python-api-url', variable: 'PYTHON_API_URL')

                ]) {

                    writeFile file: '.env', text: """

DOCKER_USERNAME=${DOCKER_USERNAME}

NODE_ENV=production

PORT=5000

MONGO_URI=${MONGO_URI}

JWT_SECRET=${JWT_SECRET}

JWT_EXPIRE=30d

MIN_SUPPORT=0.01

MIN_CONFIDENCE=0.3

MIN_LIFT=1.0

PYTHON_API_URL=${PYTHON_API_URL}

USE_PYTHON_ENGINE=false

CLIENT_URL=${CLIENT_URL}

"""

                }

            }

        }

        stage('Deploy') {

            steps {

                sh '''

                docker compose down

                docker compose pull

                docker compose up -d --remove-orphans

                '''

            }

        }

    }

    post {

        success {

            echo "==================================="

            echo "ShopFusion deployed successfully."

            echo "==================================="

        }

        failure {

            echo "==================================="

            echo "Pipeline Failed."

            echo "==================================="

        }

        always {

            sh 'docker logout || true'

            cleanWs()

        }

    }

}