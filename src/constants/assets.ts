import defaultAvatarImg from '../assets/images/orthodox_member_avatar_1794598923759.jpg';
import enterpriseBannerImg from '../assets/images/orthodox_enterprise_banner_1794598924691.jpg';
import artisanWorkspaceImg from '../assets/images/ethiopian_artisan_workspace_1794598925656.jpg';

export const DEFAULT_AVATAR_URL = defaultAvatarImg;
export const DEFAULT_ENTERPRISE_LOGO_URL = enterpriseBannerImg;
export const DEFAULT_ARTISAN_WORKSPACE_URL = artisanWorkspaceImg;
export const DEFAULT_PRODUCT_IMAGE_URL = '/assets/products/beeswax_candles.jpg';
export const DEFAULT_CATHEDRAL_BANNER_URL = '/assets/aistudio/image_6776db67.png';
export const DEFAULT_HERITAGE_DEACONS_URL = '/assets/aistudio/image_8ece76a6.png';
export const BRAND_LOGO_URL = '/assets/aistudio/image_01084dd6.png';

/**
 * Helper to prevent broken <img> frames across user avatars or uploaded product photos.
 */
export const handleImageFallback = (fallbackUrl: string = DEFAULT_AVATAR_URL) => (
  e: React.SyntheticEvent<HTMLImageElement, Event>
) => {
  const img = e.currentTarget;
  if (img.dataset.fallbackApplied === 'true') return;
  img.dataset.fallbackApplied = 'true';
  img.src = fallbackUrl;
};
