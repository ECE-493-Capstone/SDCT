import * as assert from 'assert';
import * as vscode from 'vscode';
import { ChatRoomPanel } from '../panels/ChatRoomPanel';
import { IMessage } from '../interfaces/IMessage';
import { EMessageType } from '../enums/EMessageType';

suite('Extension Test Suite', () => {
    test('Sample test', () => {
        const message: IMessage = {
            content: "test",
            sender: {
                name: "test",
                pictureUri: "test",
            },
            timestamp: new Date(),
            type: EMessageType.Text,
        };
		ChatRoomPanel.sendChatMessage("test", message);
	});
});
