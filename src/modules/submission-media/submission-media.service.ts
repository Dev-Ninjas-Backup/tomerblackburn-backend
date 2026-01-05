import { Injectable } from '@nestjs/common';
import { CreateSubmissionMediaDto } from './dto/create-submission-media.dto';
import { UpdateSubmissionMediaDto } from './dto/update-submission-media.dto';

@Injectable()
export class SubmissionMediaService {
  create(createSubmissionMediaDto: CreateSubmissionMediaDto) {
    return 'This action adds a new submissionMedia';
  }

  findAll() {
    return `This action returns all submissionMedia`;
  }

  findOne(id: number) {
    return `This action returns a #${id} submissionMedia`;
  }

  update(id: number, updateSubmissionMediaDto: UpdateSubmissionMediaDto) {
    return `This action updates a #${id} submissionMedia`;
  }

  remove(id: number) {
    return `This action removes a #${id} submissionMedia`;
  }
}
