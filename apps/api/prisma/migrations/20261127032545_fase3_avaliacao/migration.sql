-- AlterTable
ALTER TABLE `pontuacoes` ADD COLUMN `respostas` JSON NULL;

-- CreateTable
CREATE TABLE `perfil_estudante` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `curso` VARCHAR(120) NOT NULL,
    `grau` ENUM('Técnico', 'Graduação', 'Pós-Graduação') NOT NULL DEFAULT 'Graduação',
    `semestre_atual` TINYINT UNSIGNED NOT NULL,
    `instituicao_ensino` VARCHAR(150) NULL,
    `idioma` VARCHAR(50) NULL,
    `nivel_idioma` ENUM('Básico', 'Intermediário', 'Avançado', 'Fluente') NULL,
    `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `perfil_estudante_usuario_id_key`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `perfil_estudante` ADD CONSTRAINT `fk_perfil_estudante_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
