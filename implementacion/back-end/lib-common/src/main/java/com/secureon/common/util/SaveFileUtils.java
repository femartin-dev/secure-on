package com.secureon.common.util;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.secureon.common.exception.BadRequestException;
import com.secureon.common.exception.ResourceNotFoundException;

import com.secureon.common.model.entity.Evidencia;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class SaveFileUtils {
    @Value("${app.repository.path.evidencias}")
    private String basePath;
    @Value("${app.static-data.tipo-evidencia.mime-types}")
    private String mimeTypes;

    @Autowired
    private MessagesService messagesService;



    public void guardarArchivoEvidencia(Evidencia evidencia) {
        if (evidencia.getRawData() == null) {
            throw new BadRequestException(messagesService.getMessage("error.evidencia.data-missing"));
        }
        Path pathCompleto = obtenerRutaArchivo(evidencia);
        guardarArchivo(pathCompleto, evidencia.getRawData());
    }

    public void guardarArchivo(Path path, byte[] contenido) {
        try {
             Files.createDirectories(path.getParent());
             Files.write(path, contenido);
        } catch (IOException e) {
            throw new ResourceNotFoundException(messagesService.getMessage("error.evidencia.storage-failed"));
        }
    }

    public Evidencia setArchivoEvidencia(Evidencia evidencia) {
        Path rutaArchivo = obtenerRutaArchivo(evidencia);
        evidencia.setRawData(getArchivoData(rutaArchivo));
        evidencia.setMimeType(obtenerMimeType(rutaArchivo));
        return evidencia;
    }

    public byte[] getArchivoData(Path rutaArchivo) {
        try {            
            byte[] contenido = Files.readAllBytes(rutaArchivo); 
            return contenido;
        } catch (IOException e) {
            throw new ResourceNotFoundException(messagesService.getMessage("error.evidencia.storage-failed"));
        }
    }

    private Path obtenerRutaArchivo(Evidencia evidencia) {
        try {
            String nombreUserDir = evidencia.getAlarma().getUsuario().getId().toString();
            String nombreAlarmaDir = evidencia.getAlarma().getId().toString();
            String nombreArchivo = evidencia.getId().toString();
            String extension = obtenerExtensionArchivo(evidencia.getMimeType()); 
            String pathCompleto = basePath + "/" + nombreUserDir + "/" + nombreAlarmaDir + "/" + nombreArchivo + "." + extension;
            return Paths.get(pathCompleto);
        } catch (Exception e) {
            throw new ResourceNotFoundException(messagesService.getMessage("error.evidencia.storage-failed"));
        }
    }

    private String obtenerExtensionArchivo(String mimeType) {
        String res = Stream.of(mimeTypes.split(", ")).filter(mt -> mt.equals(mimeType))
                                .findFirst()
                                .orElseThrow(() -> new BadRequestException(messagesService.getMessage("error.evidencia.unsupported-mime-type")));
        String exts = res.split("/")[1];
        String tipo = res.split("/")[0];
        return exts + "." + messagesService.getMessage("app.static-data.tipo-evidencia." + tipo);
    }

    private String obtenerMimeType(Path path) {
        String fileName = path.getFileName().toString();
        String tipo = fileName.substring(fileName.lastIndexOf(".") + 1);
        String exts = fileName.substring(0, fileName.lastIndexOf(".")).substring(fileName.lastIndexOf(".") + 1);
        String mt1 = tipo.equals("sif") ? "image" : 
                     tipo.equals("svf") ? "video" : 
                     tipo.equals("saf") ? "audio" : "application";
        String mimeType = mt1 + "/" + exts;
        Stream.of(mimeTypes.split(", ")).filter(mt -> mt.equals(mimeType)).findFirst()
                                .orElseThrow(() -> new BadRequestException(messagesService.getMessage("error.evidencia.unsupported-mime-type")));
        return mimeType;                                
    }

}
