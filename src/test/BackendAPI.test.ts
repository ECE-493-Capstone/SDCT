import { assert } from "console";
import { IUser } from "../interfaces/IUser";
const { BackendAPI } = require('../backend/BackendAPI');

describe('BackendAPI Test Suite', () => {
    test('Test constructor()', () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        assert(backendAPI instanceof BackendAPI === true);
    });

    test('Test login()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const user: IUser = {
            name: "mockName",
            pictureUri: "mockUri"
        };
        let res: Boolean = false;
        res = await backendAPI.login(user);
        assert(res instanceof Boolean === true);
    });

    test('Test getFriends()' , async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const friends = await backendAPI.getFriends();
        assert(friends instanceof Array === true);
    });

    test('Test getGroups()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const groups = await backendAPI.getGroups();
        assert(groups instanceof Array === true);
    });

    test('Test addFriend()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const res = await backendAPI.addFriend("mockFriend");
        assert(res instanceof Boolean === true);
    });

    test('Test getInvites()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const invites = await backendAPI.getInvites();
        assert(invites instanceof Array === true);
    });

    test('Test acceptFriendInvite()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const res = await backendAPI.acceptFriendInvite("mockFriend");
        assert(res instanceof Boolean === true);
    });

    test('Test declienFriendInvite()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const res = await backendAPI.declineFriendInvite("mockFriend");
        assert(res instanceof Boolean === true);
    });

    test('Test createGroup()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const res = await backendAPI.createGroup("mockGroup");
        assert(res instanceof Boolean === true);
    });

    test('Test addUserToGroup()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const res = await backendAPI.addUserToGroup("mockGroup", "mockUser");
        assert(res instanceof Boolean === true);
    });

    test('Test acceptGroupInvite()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const res = await backendAPI.acceptGroupInvite("mockGroup");
        assert(res instanceof Boolean === true);
    });

    test('Test declineGroupInvite()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const res = await backendAPI.declineGroupInvite("mockGroup");
        assert(res instanceof Boolean === true);
    });

    test('Test getFriendMessageHistory()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const messages = await backendAPI.getFriendMessageHistory("mockFriend");
        assert(messages instanceof Array === true);
    });

    test('Test getGroupMessageHistory()', async () => {
        const backendAPI = new BackendAPI("mockURL", 123);
        const messages = await backendAPI.getGroupMessageHistory("mockGroup");
        assert(messages instanceof Array === true);
    });
});
