/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: ciudad360
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `analisis_ia`
--

DROP TABLE IF EXISTS `analisis_ia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `analisis_ia` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `reporte_id` bigint(20) NOT NULL,
  `categoria_predicha_id` int(11) DEFAULT NULL,
  `dependencia_sugerida_id` int(11) DEFAULT NULL,
  `prioridad_sugerida` enum('baja','media','alta','critica') DEFAULT NULL,
  `nivel_confianza` decimal(5,4) DEFAULT NULL,
  `motivo` text DEFAULT NULL,
  `modelo_utilizado` varchar(100) DEFAULT NULL,
  `resultado_json` longtext DEFAULT NULL,
  `fecha_analisis` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `categoria_predicha_id` (`categoria_predicha_id`),
  KEY `dependencia_sugerida_id` (`dependencia_sugerida_id`),
  KEY `idx_analisis_reporte` (`reporte_id`),
  CONSTRAINT `analisis_ia_ibfk_1` FOREIGN KEY (`reporte_id`) REFERENCES `reportes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `analisis_ia_ibfk_2` FOREIGN KEY (`categoria_predicha_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `analisis_ia_ibfk_3` FOREIGN KEY (`dependencia_sugerida_id`) REFERENCES `dependencias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analisis_ia`
--

LOCK TABLES `analisis_ia` WRITE;
/*!40000 ALTER TABLE `analisis_ia` DISABLE KEYS */;
INSERT INTO `analisis_ia` VALUES
(1,10,1,NULL,'critica',1.0000,'La imagen confirma plenamente la descripción: se observa un bache de gran dimensión y profundidad, inundado y con un neumático colocado como señal de advertencia en una vía de alto flujo.','gemini-3-flash-preview','{\"es_valido\":true,\"coincide_imagen_texto\":true,\"confianza_coincidencia\":1,\"motivo_validacion\":\"La imagen confirma plenamente la descripción: se observa un bache de gran dimensión y profundidad, inundado y con un neumático colocado como señal de advertencia en una vía de alto flujo.\",\"categoria\":\"BACHES\",\"dependencia_asignada\":\"Dirección de Obras Públicas y Mantenimiento Vial\",\"prioridad_nivel\":\"CRITICA\",\"prioridad_puntaje\":92,\"justificacion_prioridad\":\"El bache representa un peligro inminente por su profundidad y por estar oculto bajo el agua en una avenida principal, lo que puede causar accidentes graves o daños severos a los vehículos.\",\"nuevo_estado\":\"DESPACHO_INMEDIATO\",\"mensaje_para_ciudadano\":\"Agradecemos su reporte. Dada la peligrosidad del bache y su ubicación en una vía principal, hemos clasificado este reporte como prioridad crítica y se ha despachado una cuadrilla de emergencia para su atención inmediata.\"}','2026-11-12 05:49:01'),
(2,11,1,NULL,'critica',1.0000,'La imagen muestra con total claridad un bache de gran tamaño y profundidad inundado con una llanta en su interior, coincidiendo plenamente con la descripción proporcionada por el ciudadano.','gemini-3-flash-preview','{\"es_valido\":true,\"coincide_imagen_texto\":true,\"confianza_coincidencia\":1,\"motivo_validacion\":\"La imagen muestra con total claridad un bache de gran tamaño y profundidad inundado con una llanta en su interior, coincidiendo plenamente con la descripción proporcionada por el ciudadano.\",\"categoria\":\"BACHES\",\"dependencia_asignada\":\"Dirección de Obras Públicas y Mantenimiento Vial\",\"prioridad_nivel\":\"CRITICA\",\"prioridad_puntaje\":92,\"justificacion_prioridad\":\"Se trata de un bache profundo en una avenida principal que representa un peligro inminente para la seguridad vial. El hecho de estar inundado oculta su profundidad, aumentando el riesgo de accidentes graves.\",\"nuevo_estado\":\"DESPACHO_INMEDIATO\",\"mensaje_para_ciudadano\":\"Agradecemos su reporte. Debido a la peligrosidad y ubicación del bache, hemos clasificado su reporte como prioridad crítica. Se ha enviado una cuadrilla de emergencia para señalizar y reparar el daño a la brevedad.\"}','2026-11-12 05:49:21'),
(3,12,2,NULL,'media',0.9500,'La imagen muestra claramente un poste de alumbrado público con las lámparas apagadas durante la noche, mientras que otras luces al fondo están encendidas, lo cual valida el reporte de luminaria fundida.','gemini-3-flash-preview','{\"es_valido\":true,\"coincide_imagen_texto\":true,\"confianza_coincidencia\":0.95,\"motivo_validacion\":\"La imagen muestra claramente un poste de alumbrado público con las lámparas apagadas durante la noche, mientras que otras luces al fondo están encendidas, lo cual valida el reporte de luminaria fundida.\",\"categoria\":\"ALUMBRADO\",\"dependencia_asignada\":\"Dirección de Servicios Públicos - Departamento de Alumbrado\",\"prioridad_nivel\":\"MEDIA\",\"prioridad_puntaje\":50,\"justificacion_prioridad\":\"La falta de iluminación en vía pública representa un riesgo moderado para la seguridad ciudadana y vial, aunque al ser un reporte individual se clasifica en prioridad media para atención programada.\",\"nuevo_estado\":\"VALIDADO_EN_COLA\",\"mensaje_para_ciudadano\":\"Gracias por su reporte. Hemos validado la falla en la luminaria y se ha turnado al departamento de Alumbrado Público para su reparación en el próximo ciclo de mantenimiento.\"}','2026-11-12 05:53:54'),
(4,13,2,NULL,'media',0.8500,'Validado por coincidencia semántica.','gemini-3-flash-preview','{\"es_valido\":true,\"coincide_imagen_texto\":true,\"confianza_coincidencia\":0.85,\"motivo_validacion\":\"Validado por coincidencia semántica.\",\"categoria\":\"ALUMBRADO\",\"dependencia_asignada\":\"Alumbrado Público\",\"prioridad_nivel\":\"MEDIA\",\"prioridad_puntaje\":62,\"justificacion_prioridad\":\"Prioridad MEDIA asignada por impacto en ALUMBRADO.\",\"nuevo_estado\":\"VALIDADO_EN_COLA\",\"mensaje_para_ciudadano\":\"Reporte validado y enviado a Alumbrado Público.\"}','2026-11-12 05:58:21'),
(5,14,5,NULL,'media',0.8500,'Validado por coincidencia semántica.','gemini-3-flash-preview','{\"es_valido\":true,\"coincide_imagen_texto\":true,\"confianza_coincidencia\":0.85,\"motivo_validacion\":\"Validado por coincidencia semántica.\",\"categoria\":\"OTRO\",\"dependencia_asignada\":\"Atención Ciudadana\",\"prioridad_nivel\":\"MEDIA\",\"prioridad_puntaje\":50,\"justificacion_prioridad\":\"Prioridad MEDIA asignada por impacto en OTRO.\",\"nuevo_estado\":\"VALIDADO_EN_COLA\",\"mensaje_para_ciudadano\":\"Reporte validado y enviado a Atención Ciudadana.\"}','2026-11-12 06:34:30'),
(19,28,2,NULL,'media',0.9500,'La imagen muestra claramente una luminaria de doble brazo apagada en una calle donde otras luces están encendidas, lo cual es consistente con el reporte de foco fundido.','gemini-3-flash-preview','{\"es_valido\":true,\"coincide_imagen_texto\":true,\"confianza_coincidencia\":0.95,\"motivo_validacion\":\"La imagen muestra claramente una luminaria de doble brazo apagada en una calle donde otras luces están encendidas, lo cual es consistente con el reporte de foco fundido.\",\"categoria\":\"ALUMBRADO\",\"dependencia_asignada\":\"Dirección de Servicios Públicos - Alumbrado Público\",\"prioridad_nivel\":\"MEDIA\",\"prioridad_puntaje\":55,\"justificacion_prioridad\":\"La falta de iluminación en la vía pública afecta la seguridad de los peatones y conductores, aunque no representa un peligro inminente de vida.\",\"nuevo_estado\":\"VALIDADO_EN_COLA\",\"mensaje_para_ciudadano\":\"Gracias por su reporte. Hemos validado la falla en la luminaria y se ha turnado al departamento de Alumbrado Público para su reparación programada.\"}','2026-11-12 12:03:32'),
(20,29,1,NULL,'critica',1.0000,'La imagen muestra claramente un bache de gran tamaño lleno de agua con una llanta en su interior, coincidiendo plenamente con la descripción proporcionada por el ciudadano.','gemini-3-flash-preview','{\"es_valido\":true,\"coincide_imagen_texto\":true,\"confianza_coincidencia\":1,\"motivo_validacion\":\"La imagen muestra claramente un bache de gran tamaño lleno de agua con una llanta en su interior, coincidiendo plenamente con la descripción proporcionada por el ciudadano.\",\"categoria\":\"BACHES\",\"dependencia_asignada\":\"Secretaría de Obras Públicas y Mantenimiento Vial\",\"prioridad_nivel\":\"CRITICA\",\"prioridad_puntaje\":92,\"justificacion_prioridad\":\"El bache presenta dimensiones y profundidad considerables en una vía de tránsito. El hecho de estar cubierto por agua aumenta el riesgo de accidentes al ocultar su profundidad real, y la presencia de una llanta indica que ya es un peligro reconocido por la comunidad.\",\"nuevo_estado\":\"DESPACHO_INMEDIATO\",\"mensaje_para_ciudadano\":\"Gracias por su reporte. Hemos validado la gravedad del bache y, debido al riesgo que representa para la seguridad vial, se ha clasificado como prioridad crítica. Se ha enviado una orden de despacho inmediato para su reparación.\"}','2026-11-12 12:55:33'),
(21,30,1,NULL,'critica',1.0000,'La imagen muestra claramente un bache de gran tamaño y profundidad con acumulación de agua, coincidiendo plenamente con la descripción proporcionada por el ciudadano.','gemini-3-flash-preview','{\"es_valido\":true,\"coincide_imagen_texto\":true,\"confianza_coincidencia\":1,\"motivo_validacion\":\"La imagen muestra claramente un bache de gran tamaño y profundidad con acumulación de agua, coincidiendo plenamente con la descripción proporcionada por el ciudadano.\",\"categoria\":\"BACHES\",\"dependencia_asignada\":\"Secretaría de Obras Públicas y Mantenimiento Vial\",\"prioridad_nivel\":\"CRITICA\",\"prioridad_puntaje\":90,\"justificacion_prioridad\":\"El bache presenta dimensiones considerables y profundidad, agravado por la presencia de agua que oculta el riesgo. Se encuentra en una vía que parece ser de alto flujo, lo que representa un peligro inminente para la seguridad vial y la integridad de los vehículos.\",\"nuevo_estado\":\"DESPACHO_INMEDIATO\",\"mensaje_para_ciudadano\":\"Su reporte ha sido validado con éxito. Debido a la peligrosidad y dimensiones del bache detectado, se ha asignado prioridad crítica y se ha despachado una cuadrilla de reparación inmediata para atender la situación.\"}','2026-11-12 13:05:56'),
(22,31,1,NULL,'critica',1.0000,'La imagen muestra claramente un bache de grandes dimensiones y profundidad en una vía pública, lo cual coincide plenamente con la descripción del ciudadano.','gemini-3-flash-preview','{\"es_valido\":true,\"coincide_imagen_texto\":true,\"confianza_coincidencia\":1,\"motivo_validacion\":\"La imagen muestra claramente un bache de grandes dimensiones y profundidad en una vía pública, lo cual coincide plenamente con la descripción del ciudadano.\",\"categoria\":\"BACHES\",\"dependencia_asignada\":\"Secretaría de Obras Públicas y Pavimentación\",\"prioridad_nivel\":\"CRITICA\",\"prioridad_puntaje\":92,\"justificacion_prioridad\":\"El bache presenta una profundidad considerable (evidenciada por el neumático sumergido) y se encuentra en una vía de tráfico vehicular, lo que representa un riesgo inminente de accidentes graves o daños estructurales a los vehículos.\",\"nuevo_estado\":\"DESPACHO_INMEDIATO\",\"mensaje_para_ciudadano\":\"Gracias por su reporte. Debido a la peligrosidad y dimensiones del bache detectado, su reporte ha sido catalogado como prioridad CRÍTICA y se ha despachado una cuadrilla de reparación inmediata para mitigar el riesgo de accidentes.\"}','2026-11-12 13:07:43'),
(23,32,1,NULL,'critica',1.0000,'La imagen muestra claramente un bache de grandes dimensiones y profundidad en una vía pública, lo cual es totalmente consistente con la descripción proporcionada por el ciudadano.','gemini-3-flash-preview','{\"es_valido\":true,\"coincide_imagen_texto\":true,\"confianza_coincidencia\":1,\"motivo_validacion\":\"La imagen muestra claramente un bache de grandes dimensiones y profundidad en una vía pública, lo cual es totalmente consistente con la descripción proporcionada por el ciudadano.\",\"categoria\":\"BACHES\",\"dependencia_asignada\":\"Secretaría de Obras Públicas y Servicios Urbanos\",\"prioridad_nivel\":\"CRITICA\",\"prioridad_puntaje\":95,\"justificacion_prioridad\":\"El bache es extremadamente grande y profundo, representando un peligro inminente para la seguridad vial. La presencia de un neumático dentro del mismo indica que ya es un riesgo reconocido por los transeúntes y puede causar accidentes graves o daños severos a los vehículos.\",\"nuevo_estado\":\"DESPACHO_INMEDIATO\",\"mensaje_para_ciudadano\":\"Gracias por su reporte. Hemos validado la gravedad del bache y, debido al alto riesgo que representa para la circulación, se ha asignado prioridad CRÍTICA para su reparación inmediata. Una cuadrilla de obras públicas ha sido despachada al lugar.\"}','2026-11-12 13:08:46'),
(24,33,1,NULL,'critica',0.9800,'La imagen muestra claramente un bache de gran tamaño y profundidad en una vía asfaltada, lo cual es totalmente consistente con la descripción del ciudadano.','gemini-3-flash-preview','{\"es_valido\":true,\"coincide_imagen_texto\":true,\"confianza_coincidencia\":0.98,\"motivo_validacion\":\"La imagen muestra claramente un bache de gran tamaño y profundidad en una vía asfaltada, lo cual es totalmente consistente con la descripción del ciudadano.\",\"categoria\":\"BACHES\",\"dependencia_asignada\":\"Secretaría de Obras Públicas y Mantenimiento Vial\",\"prioridad_nivel\":\"CRITICA\",\"prioridad_puntaje\":92,\"justificacion_prioridad\":\"El bache es profundo y se encuentra en una vía que parece ser de tráfico rápido, lo que representa un peligro inminente de accidentes graves o daños severos a los vehículos.\",\"nuevo_estado\":\"DESPACHO_INMEDIATO\",\"mensaje_para_ciudadano\":\"Hemos recibido su reporte. Debido a la gravedad del bache detectado en la imagen, se ha clasificado como prioridad CRÍTICA y se ha enviado una unidad de reparación inmediata al lugar. Gracias por su reporte.\"}','2026-11-12 13:11:37'),
(25,34,1,NULL,'alta',0.9500,'Clasificación multimodal desde nota de voz ciudadana (WhatsApp)','gemini-3.8-flash','{\"es_reporte_valido\":true,\"categoria_id\":1,\"titulo\":\"Baches y luminarias apagadas en Av. Quevedo\",\"descripcion\":\"El ciudadano reporta calles en mal estado con baches que van en aumento de tamaño, además de luminarias fundidas en la banqueta que vuelven peligrosa la zona.\",\"direccion\":\"Avenida Miguel Ángel de Quevedo, Veracruz, Ver.\",\"prioridad\":\"alta\",\"confianza\":0.95,\"respuesta_voz\":\"Hola, don Víctor. Ya registramos su reporte sobre los baches y luminarias en Avenida Miguel Ángel de Quevedo. Las áreas de Obras Públicas y Alumbrado lo atenderán a la brevedad. ¡Gracias!\"}','2026-11-12 14:53:21'),
(26,35,1,NULL,'alta',0.9500,'Clasificación multimodal desde nota de voz ciudadana (WhatsApp)','gemini-3.5-flash','{\"es_reporte_valido\":true,\"categoria_id\":1,\"titulo\":\"Baches y alumbrado fundido en Av. Miguel Ángel de Quevedo\",\"descripcion\":\"El ciudadano Víctor Arturo reporta vialidad en muy mal estado con baches de gran tamaño que incrementan día a día, además de luminarias fundidas que generan oscuridad y peligro en la zona.\",\"direccion\":\"Avenida Miguel Ángel de Quevedo, Veracruz, Ver.\",\"prioridad\":\"alta\",\"confianza\":0.95,\"respuesta_voz\":\"Hola don Víctor, mucho gusto. Con gusto registramos su reporte sobre los baches y el alumbrado en la Avenida Miguel Ángel de Quevedo. El área de Obras Públicas y Mantenimiento atendera su solicitud muy pronto.\"}','2026-11-12 14:58:04'),
(27,36,1,NULL,'alta',0.9600,'Clasificación multimodal desde nota de voz ciudadana (WhatsApp)','gemini-3.5-flash','{\"es_reporte_valido\":true,\"categoria_id\":1,\"titulo\":\"Baches y luminarias fundidas en Av. Miguel Ángel de Quevedo\",\"descripcion\":\"El ciudadano reporte que la calle presenta múltiples baches que aumentan de tamaño, así como luminarias fundidas que vuelven la zona oscura y peligrosa.\",\"direccion\":\"Avenida Miguel Ángel de Quevedo, Veracruz, Ver.\",\"prioridad\":\"alta\",\"confianza\":0.96,\"respuesta_voz\":\"Hola, don Víctor. Con gusto registramos su reporte sobre los baches y luminarias en la Avenida Miguel Ángel de Quevedo. El equipo de Obras Públicas lo atenderá a la brevedad. ¡Que tenga excelente día!\"}','2026-11-12 15:59:15'),
(28,37,1,NULL,'alta',0.9500,'Clasificación multimodal desde nota de voz ciudadana (WhatsApp)','gemini-3.5-flash','{\"es_reporte_valido\":true,\"categoria_id\":1,\"titulo\":\"Baches y luminarias en Av. Miguel Ángel de Quevedo\",\"descripcion\":\"El ciudadano Víctor Pacheco reporta varios baches que están aumentando de tamaño y luminarias fundidas que provocan inseguridad en la zona.\",\"direccion\":\"Avenida Miguel Ángel de Quevedo, Veracruz, Ver.\",\"prioridad\":\"alta\",\"confianza\":0.95,\"respuesta_voz\":\"Hola, don Víctor. Ya registramos su reporte sobre los baches y luminarias en la avenida Miguel Ángel de Quevedo. El equipo de Obras Públicas se encargará de atenderlo pronto. ¡Que tenga un excelente día!\"}','2026-11-12 16:00:09');
/*!40000 ALTER TABLE `analisis_ia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asignaciones`
--

DROP TABLE IF EXISTS `asignaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignaciones` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `reporte_id` bigint(20) NOT NULL,
  `dependencia_id` int(11) NOT NULL,
  `usuario_asignado_id` int(11) DEFAULT NULL,
  `tipo_asignacion` enum('ia','manual') NOT NULL,
  `asignado_por_ia` tinyint(1) DEFAULT 0,
  `fecha_asignacion` timestamp NULL DEFAULT current_timestamp(),
  `observaciones` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dependencia_id` (`dependencia_id`),
  KEY `usuario_asignado_id` (`usuario_asignado_id`),
  KEY `idx_asignaciones_reporte` (`reporte_id`),
  CONSTRAINT `asignaciones_ibfk_1` FOREIGN KEY (`reporte_id`) REFERENCES `reportes` (`id`),
  CONSTRAINT `asignaciones_ibfk_2` FOREIGN KEY (`dependencia_id`) REFERENCES `dependencias` (`id`),
  CONSTRAINT `asignaciones_ibfk_3` FOREIGN KEY (`usuario_asignado_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaciones`
--

LOCK TABLES `asignaciones` WRITE;
/*!40000 ALTER TABLE `asignaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `asignaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `dependencia_id` int(11) DEFAULT NULL,
  `activa` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `dependencia_id` (`dependencia_id`),
  CONSTRAINT `categorias_ibfk_1` FOREIGN KEY (`dependencia_id`) REFERENCES `dependencias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES
(1,'Baches','Daños en calles y pavimento',1,1),
(2,'Alumbrado','Luminarias apagadas o dañadas',2,1),
(3,'Fugas de agua','Fugas en tuberías y suministro',3,1),
(4,'Basura','Acumulación de residuos',4,1),
(5,'Otros','Reportes ciudadanos que no pertenecen a las categorías existentes',NULL,1);
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dependencias`
--

DROP TABLE IF EXISTS `dependencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dependencias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `correo_contacto` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `activa` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dependencias`
--

LOCK TABLES `dependencias` WRITE;
/*!40000 ALTER TABLE `dependencias` DISABLE KEYS */;
INSERT INTO `dependencias` VALUES
(1,'Obras Públicas','Atención de baches e infraestructura',NULL,NULL,1,'2026-11-11 22:32:46'),
(2,'Alumbrado Público','Mantenimiento de luminarias',NULL,NULL,1,'2026-11-11 22:32:46'),
(3,'Agua Potable','Atención de fugas y suministro',NULL,NULL,1,'2026-11-11 22:32:46'),
(4,'Servicios Públicos','Recolección de basura y limpieza',NULL,NULL,1,'2026-11-11 22:32:46');
/*!40000 ALTER TABLE `dependencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estados_reporte`
--

DROP TABLE IF EXISTS `estados_reporte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `estados_reporte` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(40) NOT NULL,
  `descripcion` varchar(150) DEFAULT NULL,
  `es_final` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estados_reporte`
--

LOCK TABLES `estados_reporte` WRITE;
/*!40000 ALTER TABLE `estados_reporte` DISABLE KEYS */;
INSERT INTO `estados_reporte` VALUES
(1,'Recibido','Reporte registrado',0),
(2,'En atención','Reporte asignado a una dependencia',0),
(3,'Resuelto','Problema solucionado',1),
(4,'Rechazado','Reporte no procedente',1);
/*!40000 ALTER TABLE `estados_reporte` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evidencias`
--

DROP TABLE IF EXISTS `evidencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `evidencias` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `reporte_id` bigint(20) NOT NULL,
  `ruta_archivo` varchar(500) NOT NULL,
  `nombre_archivo` varchar(255) DEFAULT NULL,
  `tipo_mime` varchar(100) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `reporte_id` (`reporte_id`),
  CONSTRAINT `evidencias_ibfk_1` FOREIGN KEY (`reporte_id`) REFERENCES `reportes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evidencias`
--

LOCK TABLES `evidencias` WRITE;
/*!40000 ALTER TABLE `evidencias` DISABLE KEYS */;
INSERT INTO `evidencias` VALUES
(4,10,'/imagenes/74e9f329bddbc3b949a2d72458b3e8a6.jpg','bache2.jpg','image/jpeg','2026-11-12 05:49:01'),
(5,11,'/imagenes/3ea0b6316be34f0e6e7b136f1b934f0b.jpg','bache2.jpg','image/jpeg','2026-11-12 05:49:21'),
(6,12,'/imagenes/bf416c742a0e5d041e330a2a7c3137be.jpg','evidencia.jpg','image/jpeg','2026-11-12 05:53:54'),
(7,13,'/imagenes/b164fca8ada94dbb68e61288209408ab.jpg','evidencia.jpg','image/jpeg','2026-11-12 05:58:21'),
(8,14,'/imagenes/c79b7299526e7c3b9508c1796b7b5085.jpg','evidencia.jpg','image/jpeg','2026-11-12 06:34:30'),
(22,28,'/imagenes/c0ca226b4c31a89d70a974af6018d6f9.jpg','evidencia.jpg','image/jpeg','2026-11-12 12:03:32'),
(23,29,'/imagenes/5a0b3142ee58654c621e4655d2ee889a.jpg','evidencia.jpg','image/jpeg','2026-11-12 12:55:33'),
(24,30,'/imagenes/70a5b57c95a9d94395984f1a16501174.jpg','evidencia.jpg','image/jpeg','2026-11-12 13:05:56'),
(25,31,'/imagenes/8a45f15be6545b63d2a7a6cae0bfddc4.jpg','evidencia.jpg','image/jpeg','2026-11-12 13:07:43'),
(26,32,'/imagenes/53ae4b545c90bd1f49dc246ee01db7b9.jpg','evidencia.jpg','image/jpeg','2026-11-12 13:08:46'),
(27,33,'/imagenes/ac4b01b1b2a32e36b7ee0dbf118f1528.jpg','evidencia.jpg','image/jpeg','2026-11-12 13:11:37');
/*!40000 ALTER TABLE `evidencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones_whatsapp`
--

DROP TABLE IF EXISTS `notificaciones_whatsapp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones_whatsapp` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `reporte_id` bigint(20) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `mensaje` text DEFAULT NULL,
  `estado` enum('pendiente','enviado','entregado','fallido') NOT NULL DEFAULT 'pendiente',
  `id_mensaje_meta` varchar(150) DEFAULT NULL,
  `error` text DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_notificaciones_reporte` (`reporte_id`),
  KEY `idx_notificaciones_estado` (`estado`),
  CONSTRAINT `fk_notificaciones_reporte` FOREIGN KEY (`reporte_id`) REFERENCES `reportes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones_whatsapp`
--

LOCK TABLES `notificaciones_whatsapp` WRITE;
/*!40000 ALTER TABLE `notificaciones_whatsapp` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificaciones_whatsapp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reportes`
--

DROP TABLE IF EXISTS `reportes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `reportes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `folio` varchar(30) NOT NULL,
  `codigo_seguimiento_hash` varchar(255) NOT NULL,
  `nombre_reportante` varchar(120) DEFAULT NULL,
  `correo_reportante` varchar(150) DEFAULT NULL,
  `telefono_reportante` varchar(20) DEFAULT NULL,
  `descripcion` text NOT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `estado_id` int(11) NOT NULL,
  `prioridad` enum('baja','media','alta','critica') DEFAULT 'media',
  `latitud` decimal(10,7) DEFAULT NULL,
  `longitud` decimal(10,7) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `dependencia_actual_id` int(11) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `consentimiento_whatsapp` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_consentimiento_whatsapp` datetime DEFAULT NULL,
  `codigo_seguimiento` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `folio` (`folio`),
  KEY `idx_reportes_estado` (`estado_id`),
  KEY `idx_reportes_categoria` (`categoria_id`),
  KEY `idx_reportes_dependencia` (`dependencia_actual_id`),
  KEY `idx_reportes_fecha` (`fecha_creacion`),
  CONSTRAINT `reportes_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `reportes_ibfk_2` FOREIGN KEY (`estado_id`) REFERENCES `estados_reporte` (`id`),
  CONSTRAINT `reportes_ibfk_3` FOREIGN KEY (`dependencia_actual_id`) REFERENCES `dependencias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reportes`
--

LOCK TABLES `reportes` WRITE;
/*!40000 ALTER TABLE `reportes` DISABLE KEYS */;
INSERT INTO `reportes` VALUES
(10,'C360-1794462540911-2E1C73','29a0e94fe330896a26bbe4c70807fb640d22e3dc16805724b572c9cb9d2de2be',NULL,NULL,NULL,'Bache inundado con llanta\n\nBache profundo lleno de agua en avenida principal con una llanta adentro',1,1,'critica',19.1812000,-96.1325000,'Av. Díaz Mirón, Veracruz',NULL,'2026-11-12 05:49:01','2026-11-12 05:49:01',0,NULL,NULL),
(11,'C360-1794462561168-0B60AE','3cc2e29f57e6a49e1379edbab3b3b0c2c5f7f1adceb402d684132913a074873d',NULL,NULL,NULL,'Bache inundado con llanta\n\nBache profundo lleno de agua en avenida principal con una llanta adentro',1,1,'critica',19.1812000,-96.1325000,'Av. Díaz Mirón, Veracruz',NULL,'2026-11-12 05:49:21','2026-11-12 05:49:21',0,NULL,NULL),
(12,'C360-1794462834020-A39901','f05b23f54f9cfc22356db2314c753af1fd46d779f9ccde6727abfad88c689224',NULL,NULL,NULL,'Luminaria\n\nfundida',2,1,'media',19.1987326,-96.1608082,'Tecnologigo itver',NULL,'2026-11-12 05:53:54','2026-11-12 05:53:54',0,NULL,NULL),
(13,'C360-1794463101303-E24749','c286f4e0929b81f78f6788884b0c895b8d28d39bb2c93d0336e18694a7b816e9',NULL,NULL,NULL,'Luminaria fallosa\n\nFalla mucho',2,2,'media',NULL,NULL,'Tecnológico ver',NULL,'2026-11-12 05:58:21','2026-11-12 08:26:53',0,NULL,NULL),
(14,'C360-1794465270346-45FBEF','3ffe5cb6e19c488032217db86b590547518c5b148bbf3dae9e1b93890c82cbd9',NULL,NULL,NULL,'Je\n\nA',5,2,'media',NULL,NULL,'A',NULL,'2026-11-12 06:34:30','2026-11-12 08:26:51',0,NULL,NULL),
(28,'C360-1794485012119-A0C239','b07cf4c289b4890ec04349962e66ef82154ce20265147bf51983089a45c54c63',NULL,'maxmessi328@gmail.com','+522293629420','Foco fundido\n\nLuminaria fundida',2,1,'media',19.1990816,-96.1610142,'Ubicación GPS: 19.199081649999997, -96.16101415',NULL,'2026-11-12 12:03:32','2026-11-12 12:03:32',1,'2026-11-12 12:03:32',NULL),
(29,'C360-1794488133169-344318','f07751cc38ccd160bb0da692a5cd7de5af4175c43627e76e70cb3e56e8be3920',NULL,'rgm050501@gmail.com','+522294168616','bache\n\nBache con agua y una llanta',1,1,'critica',19.1917103,-96.1633145,'Ubicación GPS: 19.1917103, -96.1633145',NULL,'2026-11-12 12:55:33','2026-11-12 12:55:33',1,'2026-11-12 12:55:33',NULL),
(30,'C360-1794488756722-6486F1','a870ea464ad43d654eb265e7e479fe70f885ba646d3a0b7fd0ebf357c299c2e2',NULL,'rgm050501@gmail.com','+522294168616','Bache\n\nBache grande con agua',1,1,'critica',19.1985948,-96.1608917,'Ubicación GPS: 19.1985948, -96.1608917',NULL,'2026-11-12 13:05:56','2026-11-12 13:05:56',1,'2026-11-12 13:05:56',NULL),
(31,'C360-1794488863865-5D4237','0f1e7eda8eae870358cc7a7a0faf0e6fe412e385cd9fddc1de4bc2643e9473e6',NULL,'rgm050501@gmail.com','+522294168616','Bache\n\nBache',1,1,'critica',19.1986082,-96.1608789,'Ubicación GPS: 19.1986082, -96.1608789',NULL,'2026-11-12 13:07:43','2026-11-12 13:07:43',1,'2026-11-12 13:07:43',NULL),
(32,'C360-1794488926795-4DF276','77c9a1d2c762f8251321fe21860aa965a76a3cfee7f8e9e5700a8e0c03ce6be1',NULL,'rgm050501@gmail.com','+522294168616','Bache\n\nbache',1,1,'critica',19.1986006,-96.1608828,'Ubicación GPS: 19.1986006, -96.1608828',NULL,'2026-11-12 13:08:46','2026-11-12 13:08:46',1,'2026-11-12 13:08:46',NULL),
(33,'C360-1794489096948-D6E6AB','7e0582fa012ccb04a4bbf09b33921f860defa830308818f874726acd8c0c8300',NULL,'rgm050501@gmail.com','+522294168616','Bache\n\nbache',1,1,'critica',19.1986082,-96.1608789,'Ubicación GPS: 19.1986082, -96.1608789',NULL,'2026-11-12 13:11:37','2026-11-12 13:11:37',1,'2026-11-12 13:11:37',NULL),
(34,'VER-VOZ-1441','a5f56ddded56e6076bcfbff9e72c82fe7ca016ce178048b6f5916979da6a629b',NULL,NULL,'+5212294168616','[Reporte por Nota de Voz WhatsApp] Baches y luminarias apagadas en Av. Quevedo: El ciudadano reporta calles en mal estado con baches que van en aumento de tamaño, además de luminarias fundidas en la banqueta que vuelven peligrosa la zona.',1,1,'alta',19.2006000,-96.1385000,'Avenida Miguel Ángel de Quevedo, Veracruz, Ver.',NULL,'2026-11-12 14:53:21','2026-11-12 14:53:21',1,'2026-11-12 14:53:21',NULL),
(35,'VER-VOZ-3635','c5f34dfe9a153cf558d5887d1b6c678c7ec5e4ca70caa961e640b55eed513186',NULL,NULL,'+5212294168616','[Reporte por Nota de Voz WhatsApp] Baches y alumbrado fundido en Av. Miguel Ángel de Quevedo: El ciudadano Víctor Arturo reporta vialidad en muy mal estado con baches de gran tamaño que incrementan día a día, además de luminarias fundidas que generan oscuridad y peligro en la zona.',1,1,'alta',19.2006000,-96.1385000,'Avenida Miguel Ángel de Quevedo, Veracruz, Ver.',NULL,'2026-11-12 14:58:04','2026-11-12 14:58:04',1,'2026-11-12 14:58:04',NULL),
(36,'VER-VOZ-3095','8078207732776e8fc4c5245d7a5b6e4dc79cb1d622004372c6e3c0ec1b59db70',NULL,NULL,'+5212294168616','[Reporte por Nota de Voz WhatsApp] Baches y luminarias fundidas en Av. Miguel Ángel de Quevedo: El ciudadano reporte que la calle presenta múltiples baches que aumentan de tamaño, así como luminarias fundidas que vuelven la zona oscura y peligrosa.',1,1,'alta',19.2006000,-96.1385000,'Avenida Miguel Ángel de Quevedo, Veracruz, Ver.',NULL,'2026-11-12 15:59:15','2026-11-12 15:59:15',1,'2026-11-12 15:59:15',NULL),
(37,'VER-VOZ-7575','4d96f6ceef236afb96d288c93fd46ec6bdd7d09232f0aabf28e7866feb29f9df',NULL,NULL,'+5212294168616','[Reporte por Nota de Voz WhatsApp] Baches y luminarias en Av. Miguel Ángel de Quevedo: El ciudadano Víctor Pacheco reporta varios baches que están aumentando de tamaño y luminarias fundidas que provocan inseguridad en la zona.',1,1,'alta',19.2006000,-96.1385000,'Avenida Miguel Ángel de Quevedo, Veracruz, Ver.',NULL,'2026-11-12 16:00:09','2026-11-12 16:00:09',1,'2026-11-12 16:00:09',NULL);
/*!40000 ALTER TABLE `reportes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `descripcion` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES
(1,'Administrador','Control total del sistema'),
(2,'Supervisor','Supervisión de reportes'),
(3,'Funcionario','Atención de reportes ciudadanos');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seguimiento`
--

DROP TABLE IF EXISTS `seguimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `seguimiento` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `reporte_id` bigint(20) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `estado_anterior_id` int(11) DEFAULT NULL,
  `estado_nuevo_id` int(11) NOT NULL,
  `comentario_publico` text DEFAULT NULL,
  `nota_interna` text DEFAULT NULL,
  `fecha` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `estado_anterior_id` (`estado_anterior_id`),
  KEY `estado_nuevo_id` (`estado_nuevo_id`),
  KEY `idx_seguimiento_reporte` (`reporte_id`),
  CONSTRAINT `seguimiento_ibfk_1` FOREIGN KEY (`reporte_id`) REFERENCES `reportes` (`id`),
  CONSTRAINT `seguimiento_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `seguimiento_ibfk_3` FOREIGN KEY (`estado_anterior_id`) REFERENCES `estados_reporte` (`id`),
  CONSTRAINT `seguimiento_ibfk_4` FOREIGN KEY (`estado_nuevo_id`) REFERENCES `estados_reporte` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seguimiento`
--

LOCK TABLES `seguimiento` WRITE;
/*!40000 ALTER TABLE `seguimiento` DISABLE KEYS */;
/*!40000 ALTER TABLE `seguimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rol_id` int(11) NOT NULL,
  `dependencia_id` int(11) DEFAULT NULL,
  `nombre` varchar(120) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`),
  KEY `rol_id` (`rol_id`),
  KEY `dependencia_id` (`dependencia_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`dependencia_id`) REFERENCES `dependencias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES
(1,1,NULL,'Administrador','admin@ciudad360.mx','Admin12345',1,'2026-11-12 04:11:33');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'ciudad360'
--

--
-- Dumping routines for database 'ciudad360'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-12 16:18:07
