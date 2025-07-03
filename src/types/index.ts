export interface User {
    name: string;
    username: string;
    email: string;
    account_type: "public" | "private";
    phone_number: string;
    bio?: string;
    profile_pic?: string;
    cover_pic?: string;
    dob: Date;
    verified: boolean;
    otp?: string;
    google_id: string;
}

export interface Post {
    description: string;
    user_id: string;
    images: string;
    hashtags: string[];
    type: "draft" | "posted";
    post_type: "post" | "story";
}

export interface titleProp {
    title: string;
}