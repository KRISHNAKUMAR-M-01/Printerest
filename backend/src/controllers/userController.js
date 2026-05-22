const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get user profile by username
// @route   GET /api/users/profile/:username
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            saves: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

// @desc    Get posts created by user
// @route   GET /api/users/profile/:username/created
// @access  Public
const getUserCreatedPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });

    res.json(posts);
  } catch (error) {
    console.error('Get created posts error:', error);
    res.status(500).json({ message: 'Server error while fetching created posts' });
  }
};

// @desc    Get posts saved by user
// @route   GET /api/users/profile/:username/saved
// @access  Public (Optionally private, but Pinterest usually makes it public/private. We will make it public for simplicity or check if req.user matches)
const getUserSavedPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const savedRecords = await prisma.save.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatarUrl: true
              }
            },
            _count: {
              select: {
                likes: true,
                comments: true
              }
            }
          }
        }
      }
    });

    // Extract the posts from the Save join records
    const posts = savedRecords.map(record => record.post);

    res.json(posts);
  } catch (error) {
    console.error('Get saved posts error:', error);
    res.status(500).json({ message: 'Server error while fetching saved posts' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, avatarUrl } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        bio,
        avatarUrl
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        createdAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

module.exports = {
  getUserProfile,
  getUserCreatedPosts,
  getUserSavedPosts,
  updateUserProfile
};
