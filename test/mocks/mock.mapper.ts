import { BaseMapper } from '../../src/common/base/base.mapper';

export const mockMapper: BaseMapper = {
    fromDto: (dto) => JSON.parse(JSON.stringify(dto)),
    toDto: (inst) => JSON.parse(JSON.stringify(inst)),
} as BaseMapper;
