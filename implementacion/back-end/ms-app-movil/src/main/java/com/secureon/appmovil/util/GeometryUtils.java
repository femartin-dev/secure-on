package com.secureon.appmovil.util;

import java.math.BigDecimal;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;


public class GeometryUtils {

    private static final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    public static Point createPoint(BigDecimal lng, BigDecimal lat, BigDecimal alt) {
        Coordinate coord = alt == null ? new Coordinate(lng.doubleValue(), lat.doubleValue()) : new Coordinate(lng.doubleValue(), lat.doubleValue(), alt.doubleValue());
        return geometryFactory.createPoint(coord);
    }

    public static Point createPoint(BigDecimal lng, BigDecimal lat) {
        return createPoint(lng, lat, null);
    }
}