package com.secureon.common.model.converter;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import jakarta.persistence.AttributeConverter;

public class OffsetDateTimeConverter implements AttributeConverter<OffsetDateTime, Instant> {
    @Override
    public Instant convertToDatabaseColumn(OffsetDateTime attribute) {
        return attribute != null ? attribute.toInstant() : null;
    }

    @Override
    public OffsetDateTime convertToEntityAttribute(Instant dbData) {
        return dbData != null ? OffsetDateTime.ofInstant(dbData, ZoneOffset.UTC) : null;
    }

}
