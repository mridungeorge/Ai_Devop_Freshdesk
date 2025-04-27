
provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "devcompass-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  
  enable_nat_gateway = true
  single_nat_gateway = true
  
  tags = {
    Terraform   = "true"
    Environment = var.environment
    Project     = "DevCompass"
  }
}

resource "aws_security_group" "jenkins" {
  name        = "jenkins-sg"
  description = "Security group for Jenkins server"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }
  
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Jenkins web interface"
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name        = "jenkins-sg"
    Terraform   = "true"
    Environment = var.environment
    Project     = "DevCompass"
  }
}

resource "aws_instance" "jenkins" {
  ami                    = var.jenkins_ami
  instance_type          = var.jenkins_instance_type
  key_name               = var.key_name
  subnet_id              = module.vpc.public_subnets[0]
  vpc_security_group_ids = [aws_security_group.jenkins.id]
  
  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y apt-transport-https ca-certificates curl software-properties-common
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
              add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
              apt-get update -y
              apt-get install -y docker-ce
              systemctl enable docker
              
              # Install Jenkins
              apt-get install -y openjdk-11-jdk
              wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | apt-key add -
              sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
              apt-get update -y
              apt-get install -y jenkins
              systemctl enable jenkins
              systemctl start jenkins
              
              # Install Docker Compose
              curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              chmod +x /usr/local/bin/docker-compose
              
              # Install kubectl
              curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
              chmod +x kubectl
              mv kubectl /usr/local/bin/
              
              # Add jenkins user to docker group
              usermod -aG docker jenkins
              
              # Install AWS CLI
              curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
              apt-get install -y unzip
              unzip awscliv2.zip
              ./aws/install
              
              # Restart Jenkins to apply changes
              systemctl restart jenkins
              EOF
  
  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }
  
  tags = {
    Name        = "jenkins-server"
    Terraform   = "true"
    Environment = var.environment
    Project     = "DevCompass"
  }
}

resource "aws_security_group" "monitoring" {
  name        = "monitoring-sg"
  description = "Security group for Prometheus and Grafana"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }
  
  ingress {
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Prometheus web interface"
  }
  
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Grafana web interface"
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name        = "monitoring-sg"
    Terraform   = "true"
    Environment = var.environment
    Project     = "DevCompass"
  }
}

resource "aws_instance" "monitoring" {
  ami                    = var.monitoring_ami
  instance_type          = var.monitoring_instance_type
  key_name               = var.key_name
  subnet_id              = module.vpc.public_subnets[0]
  vpc_security_group_ids = [aws_security_group.monitoring.id]
  
  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y apt-transport-https ca-certificates curl software-properties-common
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
              add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
              apt-get update -y
              apt-get install -y docker-ce
              systemctl enable docker
              
              # Install Docker Compose
              curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              chmod +x /usr/local/bin/docker-compose
              
              # Create directories for monitoring
              mkdir -p /opt/monitoring/prometheus
              mkdir -p /opt/monitoring/grafana/provisioning/datasources
              mkdir -p /opt/monitoring/grafana/provisioning/dashboards
              mkdir -p /opt/monitoring/grafana/dashboards
              
              # Create docker-compose.yml for monitoring
              cat > /opt/monitoring/docker-compose.yml << 'EOL'
              version: '3.8'
              
              services:
                prometheus:
                  image: prom/prometheus:latest
                  volumes:
                    - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
                    - prometheus-data:/prometheus
                  command:
                    - '--config.file=/etc/prometheus/prometheus.yml'
                    - '--storage.tsdb.path=/prometheus'
                    - '--web.console.libraries=/etc/prometheus/console_libraries'
                    - '--web.console.templates=/etc/prometheus/consoles'
                    - '--web.enable-lifecycle'
                  ports:
                    - "9090:9090"
                  restart: unless-stopped
              
                grafana:
                  image: grafana/grafana:latest
                  volumes:
                    - grafana-data:/var/lib/grafana
                    - ./grafana/provisioning:/etc/grafana/provisioning
                    - ./grafana/dashboards:/var/lib/grafana/dashboards
                  environment:
                    - GF_SECURITY_ADMIN_USER=admin
                    - GF_SECURITY_ADMIN_PASSWORD=admin
                    - GF_USERS_ALLOW_SIGN_UP=false
                  ports:
                    - "3000:3000"
                  depends_on:
                    - prometheus
                  restart: unless-stopped
              
                node-exporter:
                  image: prom/node-exporter:latest
                  volumes:
                    - /proc:/host/proc:ro
                    - /sys:/host/sys:ro
                    - /:/rootfs:ro
                  command:
                    - '--path.procfs=/host/proc'
                    - '--path.sysfs=/host/sys'
                    - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
                  ports:
                    - "9100:9100"
                  restart: unless-stopped
              
              volumes:
                prometheus-data:
                grafana-data:
              EOL
              
              # Create Prometheus config
              cat > /opt/monitoring/prometheus/prometheus.yml << 'EOL'
              global:
                scrape_interval: 15s
                evaluation_interval: 15s
              
              scrape_configs:
                - job_name: 'prometheus'
                  static_configs:
                    - targets: ['localhost:9090']
                      
                - job_name: 'node_exporter'
                  static_configs:
                    - targets: ['node-exporter:9100']
                      
                - job_name: 'jenkins'
                  metrics_path: '/prometheus/'
                  static_configs:
                    - targets: ['${aws_instance.jenkins.private_ip}:8080']
              EOL
              
              # Create Grafana datasource
              cat > /opt/monitoring/grafana/provisioning/datasources/datasource.yml << 'EOL'
              apiVersion: 1
              
              datasources:
                - name: Prometheus
                  type: prometheus
                  access: proxy
                  url: http://prometheus:9090
                  isDefault: true
                  editable: false
              EOL
              
              # Create Grafana dashboard config
              cat > /opt/monitoring/grafana/provisioning/dashboards/dashboards.yml << 'EOL'
              apiVersion: 1
              
              providers:
                - name: 'Default'
                  orgId: 1
                  folder: ''
                  type: file
                  disableDeletion: false
                  editable: true
                  options:
                    path: /var/lib/grafana/dashboards
              EOL
              
              # Start the monitoring stack
              cd /opt/monitoring
              docker-compose up -d
              EOF
  
  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }
  
  tags = {
    Name        = "monitoring-server"
    Terraform   = "true"
    Environment = var.environment
    Project     = "DevCompass"
  }
}

output "jenkins_public_ip" {
  description = "Public IP address of the Jenkins server"
  value       = aws_instance.jenkins.public_ip
}

output "monitoring_public_ip" {
  description = "Public IP address of the Monitoring server"
  value       = aws_instance.monitoring.public_ip
}

output "jenkins_url" {
  description = "URL to access Jenkins"
  value       = "http://${aws_instance.jenkins.public_ip}:8080"
}

output "prometheus_url" {
  description = "URL to access Prometheus"
  value       = "http://${aws_instance.monitoring.public_ip}:9090"
}

output "grafana_url" {
  description = "URL to access Grafana"
  value       = "http://${aws_instance.monitoring.public_ip}:3000"
}
