import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth";
import { ISubset } from "@/models/Subset";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Link from "next/link";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import EditSubsetClientForm from "./EditSubsetClientForm";
import Subset from "@/models/Subset";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";

// 简化的分组接口，用于客户端数据传递
interface SimpleSubset {
  _id: string;
  slug: string;
  display_name: string;
  characters?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface PageProps {
  params: {
    id: string;
  };
}

async function getSubset(id: string): Promise<SimpleSubset | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log('[调试] 无效的分组ID:', id);
    return null;
  }

  try {
    await dbConnect();
    const subset = await Subset.findById(id).lean();
    
    if (!subset) {
      console.log('[调试] 未找到分组:', id);
      return null;
    }

    // 转换为简化接口并使用正确的类型断言
    const subsetData = subset as any; // 使用any作为临时解决方案
    return {
      _id: subsetData._id.toString(),
      slug: subsetData.slug,
      display_name: subsetData.display_name,
      characters: subsetData.characters?.map((c: any) => c.toString()) || [],
      createdAt: subsetData.createdAt?.toISOString(),
      updatedAt: subsetData.updatedAt?.toISOString(),
    };
  } catch (error) {
    console.error('[调试] 获取分组错误:', error);
    return null;
  }
}

export default async function EditSubsetPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const { user, session } = await validateRequest();
  if (!session) {
    redirect(`/u/login?redirectTo=/a/subsets/edit/${id}`);
  }

  if (!id) {
    console.log('[调试] 缺少ID参数');
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          编辑分组
        </Typography>
        <Alert severity="error">缺少分组ID参数</Alert>
        <Button component={Link} href="/a/subsets" sx={{ mt: 2 }}>
          返回分组列表
        </Button>
      </Container>
    );
  }
  
  // 输出调试信息
  console.log(`[调试] 处理ID: ${id}`);

  const subset = await getSubset(id);

  if (!subset) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          编辑分组
        </Typography>
        <Alert severity="error">未找到该分组</Alert>
        <Button component={Link} href="/a/subsets" sx={{ mt: 2 }}>
          返回分组列表
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          component={Link}
          href="/a/subsets"
          sx={{ mr: 2 }}
        >
          返回分组列表
        </Button>
        <Typography variant="h4" component="h1">
          编辑分组: {subset.display_name}
        </Typography>
      </Box>
      <Paper sx={{ p: 3 }}>
        <EditSubsetClientForm subset={subset} />
      </Paper>
    </Container>
  );
} 