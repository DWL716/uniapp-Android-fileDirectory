<template>
	<view class="content">
		<button @click="openRootFileDir" class="item-1 item" type="primary">获取手机目录</button>
		<button @click="openWeixinFileDir" class="item-2 item" type="primary">获取微信Download目录</button>
	</view>
</template>

<script lang="ts" setup>
	
	const openRootFileDir = () => {
		uni.navigateTo({
			url: '/pages/root-filelist/root-filelist'
		})
	}
	
	const openWeixinFileDir = () => {
		uni.navigateTo({
			url: '/pages/weixin-filelist/weixin-filelist'
		})
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	
	.item {
		margin-top: 20px;
	}
	
</style>
