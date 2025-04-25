import { CustomError } from './../../../../src/error/customError';
import { CustomResponse } from './../../../../src/constants/customResponses';
import { getParameter } from '../../../../src/utils/ssmClient';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
jest.mock('@aws-sdk/client-ssm');

describe('getParameter', () => {
  const mockSend = jest.fn();

  beforeAll(() => {
    (SSMClient as jest.Mock).mockImplementation(() => ({
      send: mockSend,
    }));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return parameter value if found', async () => {
    const parameterValue = 'TestValue';
    mockSend.mockResolvedValue({
      Parameter: { Value: parameterValue },
    });

    const result = await getParameter('TestParameter');

    expect(result).toBe(parameterValue);
    expect(mockSend).toHaveBeenCalledWith(expect.any(GetParameterCommand));
  });

  it('should throw CustomError if parameter has no value', async () => {
    mockSend.mockResolvedValueOnce({
      Parameter: { Value: undefined },
    });

    await expect(getParameter('TestParameter')).rejects.toThrow(
      new CustomError(CustomResponse.E500003.withDetails('Parameter TestParameter not found or has no value.')),
    );
  });

  it('should throw CustomError if parameter does not exist', async () => {
    mockSend.mockResolvedValueOnce({ Parameter: undefined });

    await expect(getParameter('NonexistentParameter')).rejects.toThrow(
      new CustomError(CustomResponse.E500003.withDetails('Parameter NonexistentParameter not found or has no value.')),
    );
  });

  it('should throw CustomError if there is an error fetching the parameter', async () => {
    mockSend.mockRejectedValueOnce(new Error('SSM error'));

    await expect(getParameter('TestParameter')).rejects.toThrow(
      new CustomError(CustomResponse.E500003.withDetails('Error fetching parameter TestParameter')),
    );
  });
});
