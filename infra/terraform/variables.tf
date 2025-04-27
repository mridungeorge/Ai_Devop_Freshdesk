
variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name (e.g. dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "jenkins_ami" {
  description = "AMI ID for Jenkins EC2 instance"
  type        = string
  default     = "ami-0c65adc9a5c1b5d7c" # Ubuntu 20.04 LTS (replace with the correct AMI for your region)
}

variable "monitoring_ami" {
  description = "AMI ID for Prometheus/Grafana EC2 instance"
  type        = string
  default     = "ami-0c65adc9a5c1b5d7c" # Ubuntu 20.04 LTS (replace with the correct AMI for your region)
}

variable "jenkins_instance_type" {
  description = "EC2 instance type for Jenkins"
  type        = string
  default     = "t3.medium"
}

variable "monitoring_instance_type" {
  description = "EC2 instance type for monitoring"
  type        = string
  default     = "t3.medium"
}

variable "key_name" {
  description = "SSH key pair name"
  type        = string
  default     = "devcompass"
}
