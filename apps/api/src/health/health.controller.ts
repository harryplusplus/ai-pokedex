import { Controller, Get } from '@nestjs/common'
import { Scannable } from '../component-scan/scannable.decorator.js'

@Scannable()
@Controller('/health')
export class HealthController {
  @Get('/')
  health() {
    return 'ok'
  }
}
