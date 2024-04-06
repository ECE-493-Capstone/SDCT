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
    rowid: number,
    FriendId: string,
    UserId: string
}

export interface IApiGroup{
    GroupId: number,
    GroupName: string,
}

export interface IApiMessage{
    MessageId:12,
    SendId: string,
    RecvId: string,
    MessageType: string,
    MessageTime: number,
    MessageText: string,
    MessageLoc: string,
    ImageURL: string
}
