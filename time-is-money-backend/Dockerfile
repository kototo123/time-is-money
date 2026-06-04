FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY time-is-money-backend/pom.xml .
COPY time-is-money-backend/src ./src
RUN mvn package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
