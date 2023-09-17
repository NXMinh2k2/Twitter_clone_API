export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum MediaType {
  Image,
  Video
}

export enum MediaTypeQuery {
  Image = 'image',
  Video = 'video'
}

export enum TweetType {
  Tweet,
  ReTweet,
  Comment,
  QuoteTweet
}

export enum TweetAudience {
  Everyone,
  TwitterCircle
}

export enum PeopleFollow {
  AnyOne = '0',
  Following = '1'
}
