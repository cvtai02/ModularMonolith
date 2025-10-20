# Run docker without sudo
usermod -aG docker $USER
newgrp docker

# Check service status
systemctl status docker


docker compose version             # Verify (bundled with docker-compose-plugin)
docker compose up -d               # Start stack
docker compose down                # Stop stack
docker compose logs -f             # Follow logs

docker ps                          # Running containers
docker ps -a                       # All containers
docker images                      # List images
docker exec -it <container> bash   # Shell into container
docker logs <container>            # Container logs
docker system prune -a             # Clean up everything

ls ~/*.log                         # recipe_*.log / exec_recipe.log
cat exec_recipe.log                # Main execution log