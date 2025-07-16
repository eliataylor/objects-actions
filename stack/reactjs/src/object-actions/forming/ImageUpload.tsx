import React, {ChangeEvent, useRef, useState} from "react";
import {Button, Grid} from "@mui/material";
import {AudioFile, PhotoCamera, Videocam} from "@mui/icons-material";

export interface Upload {
    id?: string;
    url: string;
    file?: Blob;
}

interface ImageUploadProps {
    field_name: string;
    mime_type: string;
    index: number;
    selected: string;
    onSelect: (image: Upload, field_name: string, index: number) => void;
    buttonProps?: any;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
                                                     onSelect,
                                                     selected,
                                                     index,
                                                     field_name,
                                                     buttonProps,
                                                     mime_type = "image"
                                                 }) => {
    const [image, setImage] = useState<Upload | null>(
        selected ? {url: selected} : null
    );
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files[0]) {
            const file = files[0];
            const url = URL.createObjectURL(file);
            const id = `${file.name}-${file.lastModified}`; // Generate ID based on file name and last modified time
            const newImage = {id, url, file};
            setImage(newImage);
            onSelect(newImage, field_name, index);
        }
    };

    const handleIconClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Grid container>
            <Grid item>
                <input
                    accept={`${mime_type}/*`}
                    style={{display: "none"}}
                    id="icon-button-file"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                />
                <label htmlFor="icon-button-file">
                    <Button
                        color="primary"
                        startIcon={mime_type === "image" ? <PhotoCamera/> : mime_type === "video" ? <Videocam/> :
                            <AudioFile/>}
                        variant={"outlined"}
                        size={"small"}
                        onClick={handleIconClick}
                        aria-label="upload picture"
                        {...buttonProps}
                    >
                        {buttonProps?.label ?? `Select ${mime_type}`}
                    </Button>
                </label>
            </Grid>
            {image && (
                <Grid item p={1}>
                    {mime_type === "image" ?
                        <img
                            src={image.url}
                            alt="preview"
                            style={{maxWidth: 100, maxHeight: 100}}
                        />
                        :
                        mime_type === "audio" ?
                            <audio
                                controls={true}
                                src={image.url}
                            />
                            :
                            <video
                                controls={true}
                                src={image.url}
                                style={{maxWidth: 100, height: 100}}
                            />

                    }

                </Grid>
            )}
        </Grid>
    );
};

export default ImageUpload;
