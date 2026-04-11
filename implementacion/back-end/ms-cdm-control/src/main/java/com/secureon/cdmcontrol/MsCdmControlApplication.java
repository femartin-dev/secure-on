package com.secureon.cdmcontrol;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.secureon.cdmcontrol", "com.secureon.common"})
public class MsCdmControlApplication {

	public static void main(String[] args) {
		SpringApplication.run(MsCdmControlApplication.class, args);
	}

}
