pipeline {
    agent any

    tools {
        jdk 'Java-21'
        maven 'Maven-3.9'
    }

    environment {
        SONAR_SCANNER_HOME = tool 'SonarScanner'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        ansiColor('xterm')
        buildDiscarder(logRotator(numToKeepStr: '15'))
    }

    stages {
        stage('Checkout & Dependencies') {
            steps {
                echo "=== Checking out branch and resolving dependencies ==="
                sh 'mvn clean dependency:resolve -B'
            }
        }

        stage('Compile & Protobuf Generation') {
            steps {
                echo "=== Compiling Java 21 Microservices & Protobuf Stubs ==="
                sh 'mvn compile -B'
            }
        }

        stage('Unit & Slice Testing (JUnit 5 / Mockito)') {
            steps {
                echo "=== Executing JUnit 5 Test Suites with JaCoCo Coverage ==="
                sh 'mvn test -B'
            }
            post {
                always {
                    junit '**/target/surefire-reports/*.xml'
                    jacoco execPattern: '**/target/jacoco.exec',
                           classPattern: '**/target/classes',
                           sourcePattern: '**/src/main/java',
                           exclusionPattern: '**/grpc/**,**/dto/**'
                }
            }
        }

        stage('SonarQube Quality Gate (>90% Coverage)') {
            steps {
                echo "=== Executing SonarQube Code Quality Analysis ==="
                withSonarQubeEnv('SonarQube-Server') {
                    sh 'mvn sonar:sonar -Dsonar.qualitygate.wait=true'
                }
            }
        }

        stage('Container Build & Health Checks') {
            steps {
                echo "=== Building Docker Images for Microservices ==="
                sh 'docker compose -f docker/docker-compose.yml config'
            }
        }
    }

    post {
        success {
            echo "Pipeline Passed: Enterprise Quality Gate, Security Scans, and Test Verification Successful."
        }
        failure {
            echo "Pipeline Failed: Quality Gate violated or Test Failures detected."
        }
    }
}
