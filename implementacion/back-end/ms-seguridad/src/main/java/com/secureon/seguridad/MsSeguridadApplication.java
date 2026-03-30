package com.secureon.seguridad;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.Import;

import com.secureon.common.config.MessageConfig;
import com.secureon.common.util.MessagesService;

//@SpringBootApplication
//@Import({ MessageConfig.class, MessagesService.class })

//@EntityScan(basePackages = "com.secureon.common.model.entity")
@SpringBootApplication(scanBasePackages = {"com.secureon.seguridad", "com.secureon.common"})
public class MsSeguridadApplication {

	public static void main(String[] args) {
		SpringApplication.run(MsSeguridadApplication.class, args);
	}

}
