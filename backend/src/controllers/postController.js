const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    // Generate static file URL (path is /uploads/filename)
    const imageUrl = `/uploads/${req.file.filename}`;

    const post = await prisma.post.create({
      data: {
        title,
        description,
        category: category || 'Uncategorized',
        imageUrl,
        authorId: req.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error while creating post' });
  }
};

// @desc    Get all posts (with search, filter, pagination)
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build query conditions
    const where = {};

    if (category && category !== 'All') {
      where.category = {
        equals: category
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    // Get posts and total count
    const [posts, total] = await prisma.$transaction([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
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
      }),
      prisma.post.count({ where })
    ]);

    const hasMore = skip + posts.length < total;

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        hasMore
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error while fetching posts' });
  }
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Public (Optional auth for checking user likes/saves)
const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;

    if (!postId || !/^[0-9a-fA-F]{24}$/.test(postId)) {
      return res.status(400).json({ message: 'Invalid Post ID' });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            bio: true
          }
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatarUrl: true
              }
            }
          }
        },
        likes: {
          select: {
            userId: true
          }
        },
        saves: {
          select: {
            userId: true
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

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get post details error:', error);
    res.status(500).json({ message: 'Server error while fetching post details' });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    if (!postId || !/^[0-9a-fA-F]{24}$/.test(postId)) {
      return res.status(400).json({ message: 'Invalid Post ID' });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({ message: 'Unauthorized. You can only delete your own posts.' });
    }

    // Delete post (cascade will delete comments, likes, saves in SQLite)
    await prisma.post.delete({
      where: { id: postId }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error while deleting post' });
  }
};

// @desc    Toggle Like on a post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    if (!postId || !/^[0-9a-fA-F]{24}$/.test(postId)) {
      return res.status(400).json({ message: 'Invalid Post ID' });
    }

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: { postId, userId }
      }
    });

    let liked = false;
    if (existingLike) {
      // Remove like
      await prisma.like.delete({
        where: {
          postId_userId: { postId, userId }
      }
      });
    } else {
      // Add like
      await prisma.like.create({
        data: { postId, userId }
      });
      liked = true;
    }

    // Fetch updated like count
    const likeCount = await prisma.like.count({
      where: { postId }
    });

    res.json({ liked, likeCount });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error while toggling like' });
  }
};

// @desc    Toggle Save on a post
// @route   POST /api/posts/:id/save
// @access  Private
const toggleSave = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    if (!postId || !/^[0-9a-fA-F]{24}$/.test(postId)) {
      return res.status(400).json({ message: 'Invalid Post ID' });
    }

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if save exists
    const existingSave = await prisma.save.findUnique({
      where: {
        postId_userId: { postId, userId }
      }
    });

    let saved = false;
    if (existingSave) {
      // Remove save
      await prisma.save.delete({
        where: {
          postId_userId: { postId, userId }
        }
      });
    } else {
      // Add save
      await prisma.save.create({
        data: { postId, userId }
      });
      saved = true;
    }

    res.json({ saved });
  } catch (error) {
    console.error('Toggle save error:', error);
    res.status(500).json({ message: 'Server error while toggling save' });
  }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const { content } = req.body;

    if (!postId || !/^[0-9a-fA-F]{24}$/.test(postId)) {
      return res.status(400).json({ message: 'Invalid Post ID' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content cannot be empty' });
    }

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        authorId: userId
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error while adding comment' });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  toggleLike,
  toggleSave,
  addComment
};
