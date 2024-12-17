import { Card, CardContent, CardMedia, Typography, Skeleton } from "@mui/material";
import { useState } from "react";

interface ServiceCardProps {
    image: string;
    title: string;
    onClick?: () => void;
}

const ServiceCard = ({ image, title, onClick }: ServiceCardProps) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
        <Card
            onClick={onClick}
            sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                }
            }}
        >
            {!imageLoaded && !imageError && (
                <Skeleton
                    variant="rectangular"
                    height={200}
                    animation="wave"
                    sx={{ borderRadius: '16px 16px 0 0' }}
                />
            )}
            <CardMedia
                component="img"
                height={200}
                image={imageError ? '/placeholder-image.jpg' : image}
                alt={title}
                sx={{
                    objectFit: 'cover',
                    borderRadius: '16px 16px 0 0',
                    display: imageLoaded ? 'block' : 'none'
                }}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                    setImageError(true);
                    setImageLoaded(true);
                }}
            />
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography
                    variant="h6"
                    align="center"
                    sx={{
                        fontWeight: 500,
                        color: 'text.primary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.4
                    }}
                >
                    {title}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default ServiceCard; 