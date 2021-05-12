export const pickerProps = {
    title: String,
    loading: {
        type: Boolean,
        value: true,
    },
    showToolbar: Boolean,
    cancelButtonText: {
        type: String,
        value: '取消',
    },
    confirmButtonText: {
        type: String,
        value: '确认',
    },
    visibleItemCount: {
        type: Number,
        value: 5,
    },
    itemHeight: {
        type: Number,
        value: 44,
    },
};
