import { Controller, Get } from '@nestjs/common'
import { Scannable } from 'nest-component-scan'

@Scannable()
@Controller('/health')
export class HealthController {
  @Get('/')
  health() {
    return 'ok'
  }
}
