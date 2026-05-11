package com.nearscop.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class NearScopApplication {

	public static void main(String[] args) {
		SpringApplication.run(NearScopApplication.class, args);
	}

}
