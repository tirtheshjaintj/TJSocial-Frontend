import { useEffect, useMemo, useState } from "react";
import { FaImage, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";
import ModalContainer from "./ModalContainer";
import { toast } from "react-toastify";
import { Editor } from '@tinymce/tinymce-react';
import sanitizeHtml from 'sanitize-html';
import axiosInstance from "../config/axiosConfig";

interface UpdateProfileProps {
    open_status: boolean;
    onClose: () => void;
    post: any;
}

function CreatePostModal({ open_status, onClose, post }: UpdateProfileProps) {
    const [postDetails, setPostDetails] = useState({
        description: post?.description || "",
        hashtags: post?.hashtags || [] as string[],
        post_type: post?.post_type || "Post",
        status: post?.typee || "posted",
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [hashtagInput, setHashtagInput] = useState("");

    const imagePreviews = useMemo(
        () => imageFiles.map((file: any) => URL.createObjectURL(file)),
        [imageFiles]
    );

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (postDetails.hashtags.length == 0) {
            toast.error("Atleast One HashTag is Needed");
            return;
        }
        if (imageFiles.length == 0) {
            toast.error("Atleast One Image is Needed");
            return;
        }
        if (!["Post", "Story"].includes(postDetails.post_type)) {
            toast.error("Not valid Post Type");
            return;
        }
        if (!["posted", "draft"].includes(postDetails.status)) {
            toast.error("Not valid Post Status");
            return;
        }
        try {
            setIsLoading(true);
            const formdata = new FormData();
            console.log(postDetails);
            formdata.append("type", postDetails.status.toLowerCase().trim());
            formdata.append("post_type", postDetails.post_type.toLowerCase().trim());
            formdata.append("description", postDetails.description.trim());
            formdata.append("hashtags", JSON.stringify(postDetails.hashtags));
            imageFiles.forEach((image: File) => {
                formdata.append("images", image);
            });
            console.log(formdata);
            const response = await axiosInstance.post("/post", formdata, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log(response);
            setImageFiles([]);
            setPostDetails({
                ...postDetails,
                description: "",
                hashtags: [] as string[],
                status: "posted",
            });
            onClose();
            toast.success("Post Published Successfully");
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPostDetails((prev) => ({ ...prev, [name]: value }));
    };

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const images = [...imageFiles, ...files];
        if (images.length > 10) {
            toast.info(`You can add ${10 - imageFiles.length} more`);
            return;
        }
        const allValidImages = images.every((file) => file.type.startsWith("image/"));
        if (!allValidImages) {
            toast.error("Only image files are allowed.");
            e.target.value = "";
            return;
        }
        setImageFiles(images);
        e.target.value = "";
    };

    const removeImage = (index: number) => {
        const updatedImages = [...imageFiles];
        updatedImages.splice(index, 1);
        setImageFiles(updatedImages);
    };

    const addHashtag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === " " || e.key === "Enter") && hashtagInput.trim()) {
            e.preventDefault();
            const cleanTag = hashtagInput.trim().replace(/^#+/, "");
            if (!postDetails.hashtags.includes(cleanTag)) {
                setPostDetails((prev) => ({
                    ...prev,
                    hashtags: [...prev.hashtags, cleanTag],
                }));
            }
            setHashtagInput("");
        }
    };

    const removeHashtag = (index: number) => {
        const updated = [...postDetails.hashtags];
        updated.splice(index, 1);
        setPostDetails((prev) => ({ ...prev, hashtags: updated }));
    };

    const getAICaption = async () => {
        try {
            if (imageFiles.length == 0) toast.error("First Upload Some Image");
            setIsLoading(true);
            const formdata = new FormData();
            formdata.append("file", imageFiles[imageFiles.length - 1]);
            formdata.append("prompt", postDetails.description);
            const response = await axiosInstance.post("/ai/caption", formdata);
            setPostDetails({ ...postDetails, description: response.data.data })
            console.log(response);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }



    useEffect(() => {
        return () => {
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imageFiles]);



    return (
        <ModalContainer onClose={onClose} open_status={open_status}>
            <motion.form
                onSubmit={handleSubmit}
                className="relative flex flex-col w-full max-w-6xl pb-10 md:pb-6 bg-white max-h-[100vh] overflow-auto dark:bg-gray-900 p-4   rounded-2xl shadow-xl"
                initial={{ y: "-50%", opacity: 0, scale: 0.9 }}
                animate={{ y: "0%", opacity: 1, scale: 1 }}
                exit={{ y: "-50%", opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                encType="multipart/form-data"
            >
                <div>
                    <FaTimes className="absolute right-5 text-xl cursor-pointer" onClick={onClose} />
                    <h2 className="text-gray-800 dark:text-white md:mb-4">
                        <span className="inline-flex items-center gap-2">
                            <label htmlFor="post_type" className="font-bold text-xl"> Create&nbsp;New</label>
                            <select
                                name="post_type"
                                id="post_type"
                                value={postDetails.post_type}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="w-full p-2 rounded-lg border bg-white dark:bg-gray-800 text-black dark:text-white"
                            >
                                <option value="Post">Post</option>
                                <option value="Story">Story</option>
                            </select>
                        </span>
                    </h2>
                </div>

                {/* Hashtags */}
                <div className="mt-4">
                    <label className="text-sm font-medium text-gray-900 dark:text-white mb-1 block">Hashtags</label>
                    <input
                        type="text"
                        value={hashtagInput}
                        onChange={(e) => {
                            const rawValue = e.target.value.trim();
                            const cleaned = rawValue.replace(/[^a-zA-Z0-9]/g, '');
                            setHashtagInput(cleaned);
                        }}
                        onKeyDown={addHashtag}
                        disabled={isLoading}
                        placeholder="Type a hashtag and press Enter or Space"
                        className="w-full p-2 mb-2 rounded-lg border bg-white dark:bg-gray-800 text-black dark:text-white"
                    />
                    <div className="flex flex-wrap gap-2">
                        {postDetails.hashtags.map((tag: string, index: number) => (
                            <div
                                key={index}
                                className="flex items-center bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-white px-2 py-1 rounded-full"
                            >
                                #{tag}
                                <FaTimes
                                    onClick={() => removeHashtag(index)}
                                    className="ml-1 cursor-pointer hover:text-red-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col-reverse md:flex-row gap-2 mt-4">
                    {/* Images */}
                    <div className="flex-1">
                        <label htmlFor="images" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                            Select Images for {postDetails.post_type} (Max 10)
                        </label>
                        <input type="file" disabled={isLoading} name="images" id="images" onChange={handleImagesChange} multiple accept="image/*" hidden />
                        <div className="grid grid-cols-4 gap-2">
                            {/* Upload Trigger */}
                            <label
                                htmlFor="images"
                                className="flex justify-center items-center border border-dashed border-gray-400 rounded-md aspect-square cursor-pointer"
                            >
                                <FaImage className="text-4xl text-gray-500" />
                            </label>

                            {/* Image Previews */}
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative w-full aspect-square overflow-hidden rounded-md">
                                    <img
                                        src={preview}
                                        alt={`preview-${index}`}
                                        className="object-cover w-full h-full"
                                    />
                                    <div
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-black/70 p-1 rounded-full cursor-pointer text-white z-10"
                                    >
                                        <FaTimes size={12} />
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* Caption Editor */}
                    <div className="flex-1">
                        <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Your {postDetails.post_type} Caption
                        </label>
                        <Editor
                            value={postDetails.description}
                            onEditorChange={(content: string) => {
                                const cleanHtml = sanitizeHtml(content, {
                                    allowedTags: [
                                        'p', 'br', 'b', 'strong', 'i', 'em', 'u', 'strike', 'span',
                                        'ul', 'blockquote', 'sub', 'sup'
                                    ]
                                });
                                setPostDetails((prev) => ({ ...prev, description: cleanHtml }));
                            }}
                            apiKey="t866eglfosscw3v3dedu32wsdfjqe5ce4qeqmom6o1kv4kfl"
                            init={{
                                height: 300,
                                menubar: false,
                                forced_root_block: 'p',
                                valid_elements:
                                    'p,b,strong,i,em,u,br,span,sub,sup,blockquote,font[size|color],strike',
                                plugins: 'paste link lists wordcount',
                                toolbar:
                                    'undo redo | bold italic underline strikethrough | alignleft aligncenter alignright',
                                paste_remove_styles: true,
                                paste_strip_class_attributes: 'all',
                            }}
                        />
                        <button
                            type="button"
                            autoFocus={false}
                            disabled={isLoading}
                            onClick={getAICaption}
                            className="px-4 py-2 m-1 float-right text-sm font-semibold  rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="spinner"></div>
                                </div>
                            ) : (
                                `AI Caption 🤖`
                            )}
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end flex-wrap mt-6 gap-4">

                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 hover:text-black cursor-pointer"
                    >
                        Close
                    </button>
                    <button
                        type="submit"
                        autoFocus={false}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="spinner"></div>
                            </div>
                        ) : (
                            `Publish`
                        )}
                    </button>
                    <select
                        name="status"
                        id="status"
                        value={postDetails.status}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="p-2 rounded-lg border bg-white dark:bg-gray-800 text-black dark:text-white"
                    >
                        <option value="posted">Posted</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>
            </motion.form>
        </ModalContainer>
    );
}

export default CreatePostModal;
