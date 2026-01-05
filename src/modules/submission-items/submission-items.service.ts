import { Injectable } from '@nestjs/common';
import { CreateSubmissionItemDto } from './dto/create-submission-item.dto';
import { UpdateSubmissionItemDto } from './dto/update-submission-item.dto';

@Injectable()
export class SubmissionItemsService {
  create(createSubmissionItemDto: CreateSubmissionItemDto) {
    return 'This action adds a new submissionItem';
  }

  findAll() {
    return `This action returns all submissionItems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} submissionItem`;
  }

  update(id: number, updateSubmissionItemDto: UpdateSubmissionItemDto) {
    return `This action updates a #${id} submissionItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} submissionItem`;
  }
}
