-- CreateTable
CREATE TABLE `permissoes` (
    `nivel_acesso` ENUM('Estudante', 'Empresa', 'Instituição de ensino') NOT NULL,
    `pode_criar_vagas` BOOLEAN NOT NULL DEFAULT false,
    `pode_candidatar` BOOLEAN NOT NULL DEFAULT false,
    `pode_ver_candidatos` BOOLEAN NOT NULL DEFAULT false,
    `pode_validar_estagio` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`nivel_acesso`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario` VARCHAR(50) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `data_nascimento` DATE NOT NULL,
    `nome_completo` VARCHAR(150) NOT NULL,
    `telefone` VARCHAR(20) NOT NULL,
    `cpf` CHAR(11) NOT NULL,
    `endereco` TEXT NULL,
    `email` VARCHAR(180) NOT NULL,
    `nivel_acesso` ENUM('Estudante', 'Empresa', 'Instituição de ensino') NOT NULL,
    `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `usuarios_usuario_key`(`usuario`),
    UNIQUE INDEX `usuarios_cpf_key`(`cpf`),
    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empresas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `razao_social` VARCHAR(150) NOT NULL,
    `nome_fantasia` VARCHAR(100) NOT NULL,
    `cnpj` VARCHAR(18) NOT NULL,
    `inscricao_estadual` VARCHAR(30) NULL,
    `ramo_atuacao` VARCHAR(80) NULL,
    `site` VARCHAR(100) NULL,
    `descricao_empresa` TEXT NULL,
    `telefone_comercial` VARCHAR(20) NOT NULL,
    `email_contato` VARCHAR(180) NOT NULL,
    `nome_responsavel` VARCHAR(100) NOT NULL,
    `cargo_responsavel` VARCHAR(50) NULL,
    `cep` VARCHAR(9) NOT NULL,
    `logradouro` VARCHAR(150) NOT NULL,
    `numero` VARCHAR(20) NOT NULL,
    `complemento` VARCHAR(50) NULL,
    `bairro` VARCHAR(100) NOT NULL,
    `cidade` VARCHAR(100) NOT NULL,
    `estado` CHAR(2) NOT NULL,
    `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `empresas_usuario_id_key`(`usuario_id`),
    UNIQUE INDEX `empresas_cnpj_key`(`cnpj`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vagas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `empresa_id` INTEGER NOT NULL,
    `titulo` VARCHAR(120) NOT NULL,
    `descricao` TEXT NOT NULL,
    `area_atuacao` VARCHAR(80) NOT NULL,
    `tipo_modelo` ENUM('Presencial', 'Híbrido', 'Remoto') NOT NULL DEFAULT 'Presencial',
    `carga_horaria_semanal` TINYINT UNSIGNED NOT NULL,
    `valor_bolsa` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `auxilio_transporte` BOOLEAN NOT NULL DEFAULT true,
    `beneficios` TEXT NULL,
    `local_atuacao` VARCHAR(150) NULL,
    `quantidade_posicoes` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    `status` ENUM('Rascunho', 'Aberta', 'Pausada', 'Encerrada') NOT NULL DEFAULT 'Aberta',
    `data_limite_inscricao` DATE NULL,
    `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_vagas_empresas`(`empresa_id`),
    INDEX `vagas_status_criado_em_idx`(`status`, `criado_em`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `perfil_desejado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vaga_id` INTEGER NOT NULL,
    `semestre_minimo` TINYINT UNSIGNED NULL DEFAULT 1,
    `semestre_maximo` TINYINT UNSIGNED NULL,
    `nivel_formacao` ENUM('Ensino Médio', 'Técnico', 'Tecnólogo', 'Bacharelado', 'Licenciatura') NOT NULL,
    `idioma_exigido` VARCHAR(50) NULL,
    `nivel_idioma` ENUM('Básico', 'Intermediário', 'Avançado', 'Fluente') NULL,
    `habilidades_tecnicas` TEXT NULL,
    `competencias_comportamentais` TEXT NULL,
    `requisitos_obrigatorios` TEXT NULL,
    `requisitos_desejaveis` TEXT NULL,

    UNIQUE INDEX `perfil_desejado_vaga_id_key`(`vaga_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `qualificacoes_cursos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vaga_id` INTEGER NOT NULL,
    `nome_curso` VARCHAR(120) NOT NULL,
    `grau` ENUM('Técnico', 'Graduação', 'Pós-Graduação') NOT NULL DEFAULT 'Graduação',
    `obrigatorio` BOOLEAN NOT NULL DEFAULT true,

    INDEX `fk_qualificacoes_vagas`(`vaga_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questionarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vaga_id` INTEGER NOT NULL,
    `titulo` VARCHAR(150) NOT NULL,
    `instrucoes` TEXT NULL,
    `nota_minima_aprovacao` DECIMAL(4, 2) NOT NULL DEFAULT 6.00,
    `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `questionarios_vaga_id_key`(`vaga_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `questionario_id` INTEGER NOT NULL,
    `enunciado` TEXT NOT NULL,
    `peso_nota` DECIMAL(4, 2) NOT NULL DEFAULT 1.00,

    INDEX `fk_questoes_questionarios`(`questionario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pontuacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vaga_id` INTEGER NOT NULL,
    `estudante_usuario_id` INTEGER NOT NULL,
    `questionario_id` INTEGER NOT NULL,
    `nota_obtida` DECIMAL(4, 2) NOT NULL,
    `pontuacao_afinidade` DECIMAL(5, 2) NULL,
    `status_aprovacao` ENUM('Aprovado', 'Reprovado', 'Em Analise') NOT NULL DEFAULT 'Em Analise',
    `data_conclusao` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_pontuacoes_usuarios`(`estudante_usuario_id`),
    INDEX `fk_pontuacoes_questionarios`(`questionario_id`),
    UNIQUE INDEX `uq_estudante_vaga`(`vaga_id`, `estudante_usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `fk_usuarios_permissoes` FOREIGN KEY (`nivel_acesso`) REFERENCES `permissoes`(`nivel_acesso`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `empresas` ADD CONSTRAINT `fk_empresas_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vagas` ADD CONSTRAINT `fk_vagas_empresas` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perfil_desejado` ADD CONSTRAINT `fk_perfil_vagas` FOREIGN KEY (`vaga_id`) REFERENCES `vagas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qualificacoes_cursos` ADD CONSTRAINT `fk_qualificacoes_vagas` FOREIGN KEY (`vaga_id`) REFERENCES `vagas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questionarios` ADD CONSTRAINT `fk_questionarios_vagas` FOREIGN KEY (`vaga_id`) REFERENCES `vagas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questoes` ADD CONSTRAINT `fk_questoes_questionarios` FOREIGN KEY (`questionario_id`) REFERENCES `questionarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pontuacoes` ADD CONSTRAINT `fk_pontuacoes_vagas` FOREIGN KEY (`vaga_id`) REFERENCES `vagas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pontuacoes` ADD CONSTRAINT `fk_pontuacoes_usuarios` FOREIGN KEY (`estudante_usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pontuacoes` ADD CONSTRAINT `fk_pontuacoes_questionarios` FOREIGN KEY (`questionario_id`) REFERENCES `questionarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Carga inicial das permissões por perfil (seção 8.1 do PDF). Sem estas linhas ninguém consegue se cadastrar.
INSERT INTO `permissoes` (`nivel_acesso`, `pode_criar_vagas`, `pode_candidatar`, `pode_ver_candidatos`, `pode_validar_estagio`) VALUES
    ('Estudante', 0, 1, 0, 0),
    ('Empresa', 1, 0, 1, 0),
    ('Instituição de ensino', 0, 0, 0, 1);
