package com.secureon.common.model.converter;

import jakarta.persistence.AttributeConverter;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

@Slf4j
public class JsonNodeConverter implements AttributeConverter<ObjectNode, String>{
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public String convertToDatabaseColumn(ObjectNode attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (Exception e) {
            log.error("Error converting ObjectNode to JSON", e);
            return null;
        }
    }
    
    @Override
    public ObjectNode convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        try {
            JsonNode jsonNode = objectMapper.readTree(dbData);
            if (jsonNode.isObject()) {
                return (ObjectNode) jsonNode;
            } else {
                log.error("JSON is not an ObjectNode: {}", dbData);
                return objectMapper.createObjectNode();
            }
        } catch (Exception e) {
            log.error("Error converting JSON to ObjectNode", e);
            return objectMapper.createObjectNode();
        }
    }
}




