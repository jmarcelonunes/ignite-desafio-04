import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateTransferUseCase } from './CreateTransferUseCase';

class CreateTransferController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { amount, description } = request.body;
    const { user_id } = request.params;
    const { id } = request.user;

    const createTransferUseCase = container.resolve(CreateTransferUseCase);
    const statement = await createTransferUseCase.execute({
      amount,
      description,
      to_id: user_id,
      sender_id: id,
    });
    return response.status(201).json(statement);
  }
}

export { CreateTransferController };
