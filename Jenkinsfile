pipeline {
    agent any

    tools {
        nodejs 'NodeJS_18'
    }

    environment {
        DOCKER_USERNAME = "23mis0203"
        IMAGE_NAME = "onlineshopping"
        IMAGE_TAG = "latest"
    }

    stages {

        stage('Clone Repository') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat '"C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe" build -t %DOCKER_USERNAME%/%IMAGE_NAME%:%IMAGE_TAG% .'
            }
        }

        stage('Login to DockerHub') {
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-cred',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        bat '''
                        echo %DOCKER_PASS% | "C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe" login -u %DOCKER_USER% --password-stdin
                        '''
                    }
                }
            }
        }

        stage('Push Image to DockerHub') {
            steps {
                bat '"C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe" push %DOCKER_USERNAME%/%IMAGE_NAME%:%IMAGE_TAG%'
            }
        }

        stage('Build Successful') {
            steps {
                echo 'Application built and pushed to DockerHub successfully!'
            }
        }
    }
}
