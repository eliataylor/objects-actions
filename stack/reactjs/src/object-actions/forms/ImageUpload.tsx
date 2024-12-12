import React, {ChangeEvent, useRef, useState} from 'react';
import {Button, Grid} from '@mui/material';
import {PhotoCamera} from '@mui/icons-material';

export interface Upload {
    id?: string;
    url: string;
    file?: Blob;
}

interface ImageUploadProps {
    field_name: string;
    index: number;
    selected: string;
    onSelect: (image: Upload, field_name: string, index: number) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({onSelect, selected, index, field_name}) => {
    const [image, setImage] = useState<Upload | null>(selected ? {url: selected} : null);
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
                    accept="image/*"
                    style={{display: 'none'}}
                    id="icon-button-file"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                />
                <label htmlFor="icon-button-file">
                    <Button color="primary" startIcon={<PhotoCamera/>}
                            variant={'outlined'}
                            onClick={handleIconClick}
                            aria-label="upload picture">
                        Browse
                    </Button>
                </label>
            </Grid>
            {image &&
              <Grid item p={1}>
                <img src={image.url} alt="preview" style={{maxWidth: 100, maxHeight: 100}}/>
              </Grid>
            }
        </Grid>
    );
};

export default ImageUpload;
