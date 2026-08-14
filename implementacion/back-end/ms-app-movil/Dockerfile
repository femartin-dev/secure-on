FROM eclipse-temurin:21-jre-alpine

# Seguridad: usuario no root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
WORKDIR /app

# Copia el JAR generado por Maven (previamente compilado en el host)
COPY target/*.jar app.jar

# Puerto de tu microservicio
EXPOSE 8091

# Healthcheck opcional (si usas actuator)
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8091/actuator/health || exit 1

# Arranque
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]