#!/bin/bash

# Script de ayuda para Docker
# Uso: ./docker.sh [comando]

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Hackathon Platform - Docker Helper${NC}\n"

case "$1" in
  build)
    echo -e "${GREEN}📦 Construyendo imagen Docker...${NC}"
    docker build -t hackathon-platform .
    echo -e "${GREEN}✅ Imagen construida exitosamente${NC}"
    ;;
    
  start)
    echo -e "${GREEN}🚀 Iniciando contenedor...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✅ Contenedor iniciado en http://localhost:3000${NC}"
    ;;
    
  stop)
    echo -e "${YELLOW}⏸️  Deteniendo contenedor...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ Contenedor detenido${NC}"
    ;;
    
  restart)
    echo -e "${YELLOW}🔄 Reiniciando contenedor...${NC}"
    docker-compose restart
    echo -e "${GREEN}✅ Contenedor reiniciado${NC}"
    ;;
    
  logs)
    echo -e "${BLUE}📋 Mostrando logs...${NC}"
    docker-compose logs -f
    ;;
    
  rebuild)
    echo -e "${YELLOW}🔨 Reconstruyendo sin cache...${NC}"
    docker-compose build --no-cache
    docker-compose up -d
    echo -e "${GREEN}✅ Reconstruido y reiniciado${NC}"
    ;;
    
  clean)
    echo -e "${YELLOW}🧹 Limpiando contenedores e imágenes...${NC}"
    docker-compose down
    docker rmi hackathon-platform 2>/dev/null || true
    echo -e "${GREEN}✅ Limpieza completada${NC}"
    ;;
    
  shell)
    echo -e "${BLUE}🐚 Abriendo shell en el contenedor...${NC}"
    docker exec -it hackathon-caminas-platform-web-1 sh
    ;;
    
  *)
    echo "Uso: ./docker.sh [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  build    - Construir imagen Docker"
    echo "  start    - Iniciar contenedor"
    echo "  stop     - Detener contenedor"
    echo "  restart  - Reiniciar contenedor"
    echo "  logs     - Ver logs en tiempo real"
    echo "  rebuild  - Reconstruir sin cache"
    echo "  clean    - Limpiar contenedores e imágenes"
    echo "  shell    - Abrir shell en el contenedor"
    echo ""
    echo "Ejemplo: ./docker.sh start"
    ;;
esac
