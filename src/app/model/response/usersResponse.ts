export interface UserResponse {
    id: number;
    userUuid: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;

    enable: boolean;
    accountLocked: boolean;

    mfa: boolean;
    mfaVerified: boolean;
    mfaSecret: string;

    failedLoginAttempts: number;
    lastLogin: string;      
}