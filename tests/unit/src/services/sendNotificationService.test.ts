import { sendNotificationService } from '../../../../src/services/sendNotificationService';
import { SqsSendMessage } from '../../../../src/utils/sqsClient';
import { 
  SQS_MESSAGE_GROUP_ID, 
  SQS_PARAMS_ENTITY_NAME_KEY, 
  SQS_PARAMS_ENTITY_RESPONSIBLE_KEY, 
  SQS_PARAMS_ENTITY_STATUS_KEY, 
  SQS_TYPE_SLACK
} from '../../../../src/constants/constants';
import { randomUUID } from 'crypto';

jest.mock('../../../../src/utils/sqsClient'); 
jest.mock('crypto')

describe('sendNotificationService', () => {
    const mockQueueUrl = 'https://sqs.mock.url';
    beforeAll(() => {
        process.env.SQS_NOTIFICATION_URL = mockQueueUrl;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should send a message with entityStatus as true', async () => {
        const entityName = 'TestEntity';
        const responsible = 'TestResponsible';
        const template = 'TestTemplate';
        const entityStatus = true;

        await sendNotificationService(entityName, responsible, template, entityStatus);

        expect(SqsSendMessage).toHaveBeenCalledTimes(1);
        expect(SqsSendMessage).toHaveBeenCalledWith({
            MessageBody: JSON.stringify([
                {
                    type: SQS_TYPE_SLACK,
                    template: { name: template },
                    parameters: [
                        { key: SQS_PARAMS_ENTITY_NAME_KEY, value: entityName },
                        { key: SQS_PARAMS_ENTITY_RESPONSIBLE_KEY, value: responsible },
                        { key: SQS_PARAMS_ENTITY_STATUS_KEY, value: 'Activada' },
                    ],
                },
            ]),
            QueueUrl: mockQueueUrl,
            MessageGroupId: SQS_MESSAGE_GROUP_ID,
            MessageDeduplicationId: undefined
        });
    });

    it('should send a message with entityStatus as false', async () => {
        const entityName = 'TestEntity';
        const responsible = 'TestResponsible';
        const template = 'TestTemplate';
        const entityStatus = false;

        await sendNotificationService(entityName, responsible, template, entityStatus);

        expect(SqsSendMessage).toHaveBeenCalledTimes(1);
        expect(SqsSendMessage).toHaveBeenCalledWith({
            MessageBody: JSON.stringify([
                {
                    type: SQS_TYPE_SLACK,
                    template: { name: template },
                    parameters: [
                        { key: SQS_PARAMS_ENTITY_NAME_KEY, value: entityName },
                        { key: SQS_PARAMS_ENTITY_RESPONSIBLE_KEY, value: responsible },
                        { key: SQS_PARAMS_ENTITY_STATUS_KEY, value: 'Inactivada' },
                    ],
                },
            ]),
            QueueUrl: mockQueueUrl,
            MessageGroupId: SQS_MESSAGE_GROUP_ID,
            MessageDeduplicationId: undefined
        });
    });

    it('should send a message without entityStatus', async () => {
        const entityName = 'TestEntity';
        const responsible = 'TestResponsible';
        const template = 'TestTemplate';


        await sendNotificationService(entityName, responsible, template);

        expect(SqsSendMessage).toHaveBeenCalledTimes(1);
        expect(SqsSendMessage).toHaveBeenCalledWith({
            MessageBody: JSON.stringify([
                {
                    type: SQS_TYPE_SLACK,
                    template: { name: template },
                    parameters: [
                        { key: SQS_PARAMS_ENTITY_NAME_KEY, value: entityName },
                        { key: SQS_PARAMS_ENTITY_RESPONSIBLE_KEY, value: responsible },
                    ],
                },
            ]),
            QueueUrl: mockQueueUrl,
            MessageGroupId: SQS_MESSAGE_GROUP_ID,
            MessageDeduplicationId: undefined

        });
    });

    it('should throw an error if QueueUrl is missing', async () => {
        delete process.env.SQS_NOTIFICATION_URL;

        const entityName = 'TestEntity';
        const responsible = 'TestResponsible';
        const template = 'TestTemplate';

        await expect(sendNotificationService(entityName, responsible, template)).rejects.toThrow();
    });
});
