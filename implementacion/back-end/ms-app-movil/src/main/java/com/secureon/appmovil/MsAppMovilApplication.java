package com.secureon.appmovil;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.secureon.appmovil", "com.secureon.common"})
public class MsAppMovilApplication {

	public static void main(String[] args) {
		SpringApplication.run(MsAppMovilApplication.class, args);
	}

}
