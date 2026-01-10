import { Controller, Get } from '@nestjs/common'
import { ProvidedIn } from '../provided-in/provided-in.decorator.js'

@ProvidedIn()
@Controller('/health')
export class HealthController {
  @Get('/')
  health() {
    return 'ok'
  }
}
