import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export function initOpenApi(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('AI 포켓몬 도감')
    .setDescription('AI 포켓몬 도감 API')
    .setVersion('0.0.0-development')
    .build()

  const documentFactory = () => SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('api', app, documentFactory)
}
