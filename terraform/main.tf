terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

resource "docker_network" "app_network" {
  name = "app-network"
}

resource "docker_volume" "postgres_data" {
  name = "postgres-data"
}

resource "docker_volume" "jenkins_data" {
  name = "jenkins-data"
}

resource "docker_image" "postgres" {
  name = "postgres:15-alpine"
}

resource "docker_container" "postgres" {
  name  = "postgres"
  image = docker_image.postgres.name
  env = [
    "POSTGRES_USER=devuser",
    "POSTGRES_PASSWORD=devpassword",
    "POSTGRES_DB=ticketdb"
  ]
  ports {
    internal = 5432
    external = 5432
  }
  volumes {
    volume_name    = docker_volume.postgres_data.name
    container_path = "/var/lib/postgresql/data"
  }
  networks_advanced {
    name = docker_network.app_network.name
  }
}

resource "docker_image" "backend" {
  name         = "backend:latest"
  build {
    context    = "../"
    dockerfile = "../Dockerfile.backend"
  }
}

resource "docker_container" "backend" {
  name  = "backend"
  image = docker_image.backend.name
  env = [
    "DATABASE_URL=postgresql://devuser:devpassword@postgres:5432/ticketdb",
    "POSTGRES_HOST=postgres",
    "POSTGRES_PORT=5432",
    "POSTGRES_USER=devuser",
    "POSTGRES_PASSWORD=devpassword",
    "POSTGRES_DB=ticketdb",
    "JWT_SECRET=your-secret-key",
    "JWT_EXPIRES_IN=7d"
  ]
  ports {
    internal = 8080
    external = 8080
  }
  depends_on = [docker_container.postgres]
  networks_advanced {
    name = docker_network.app_network.name
  }
}

resource "docker_image" "frontend" {
  name         = "frontend:latest"
  build {
    context    = "../"
    dockerfile = "../Dockerfile.frontend"
  }
}

resource "docker_container" "frontend" {
  name  = "frontend"
  image = docker_image.frontend.name
  env = [
    "VITE_API_BASE_URL=http://backend:8080/api",
    "VITE_APP_VERSION=1.0.0"
  ]
  ports {
    internal = 80
    external = 5173
  }
  depends_on = [docker_container.backend]
  networks_advanced {
    name = docker_network.app_network.name
  }
}

resource "docker_image" "jenkins" {
  name = "jenkins/jenkins:lts"
}

resource "docker_container" "jenkins" {
  name  = "jenkins"
  image = docker_image.jenkins.name
  ports {
    internal = 8080
    external = 8081
  }
  ports {
    internal = 50000
    external = 50000
  }
  volumes {
    volume_name    = docker_volume.jenkins_data.name
    container_path = "/var/jenkins_home"
  }
  networks_advanced {
    name = docker_network.app_network.name
  }
} 