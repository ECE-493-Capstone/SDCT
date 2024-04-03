export interface IApiFriendChatList{
    Username: string,
    FriendId: number,
    rowid: number;
    ContactTime: number,
    MessageId: number,
    SendId: number,
    RecvId: number,
    MessageType: number,
    MessageTime: number,
    MessageText: string,
    MessageLoc: string
}

export interface IApiGroupChatList{
    GroupName: string,
    GroupId: number,
    ContactTime: number,
    MessageId: number,
    SendId: number,
    MessageType: number,
    MessageTime: number,
    MessageText: string,
    MessageLoc: string
}

export interface IApiFriend{
    ImageURL: string,
    FriendId: string,
    UserId: string
}

export interface IApiGroup{
    GroupId: number,
    GroupName: string,
}
