import { SetMetadata } from '@nestjs/common';

import { SectorCode } from '../types/auth.types';

export const SECTORS_KEY = 'auth:sectors';

export const Sectors = (...sectors: SectorCode[]) => SetMetadata(SECTORS_KEY, sectors);
