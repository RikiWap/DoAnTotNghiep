FROM maven:3.9.6-amazoncorretto-21 AS build

WORKDIR /app
COPY pom.xml .
COPY core-backend ./core-backend
COPY entity-backend ./entity-backend
RUN mvn -B -q -DskipTests -pl core-backend -am package

# create Image
FROM amazoncorretto:21.0.4
WORKDIR /app
COPY --from=build /app/core-backend/target/*.jar app.jar
ENV SPRING_PROFILES_ACTIVE=dev

ENTRYPOINT ["java", "-jar", "app.jar"]